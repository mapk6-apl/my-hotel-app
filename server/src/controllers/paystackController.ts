import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const PAYSTACK_API_URL = 'https://api.paystack.co';
const CURRENCY = 'ZAR';
const MAX_WEBHOOK_AGE_SECONDS = 300;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PaystackTransaction = {
  id?: number | string;
  reference?: string;
  status?: string;
  currency?: string;
  amount?: number;
};

type PaystackApiResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type VerifiedTransaction = {
  transactionId: string;
  reference: string;
  status: string;
};

type PaymentAttemptRow = {
  id: string;
  reservation_id: number;
  expected_amount: string;
  status: 'pending' | 'complete' | 'failed' | 'cancelled';
  verified: boolean;
  provider_transaction_id: string | null;
  payment_status: string;
  reservation_status: string;
};

const getPaystackSecretKey = (): string => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    throw new Error('Paystack Test Mode is unavailable. Configure a test-mode PAYSTACK_SECRET_KEY.');
  }
  return secretKey;
};

const amountToKobo = (amount: string | number): number | null => {
  const normalized = String(amount);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const kobo = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(kobo) && kobo > 0 ? kobo : null;
};

const getReservationId = (value: string | string[] | undefined): number | null => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const getReference = (value: unknown): string | null =>
  typeof value === 'string' && uuidPattern.test(value) ? value : null;

const requestPaystack = async <T>(
  path: string,
  method: 'GET' | 'POST',
  secretKey: string,
  body?: Record<string, string | number>
): Promise<T> => {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Paystack request failed with HTTP ${response.status}.`);
  }
  const result = await response.json() as PaystackApiResponse<T>;
  if (!result.status || result.data === undefined) {
    throw new Error('Paystack did not accept the transaction request.');
  }
  return result.data;
};

const verifyPaystackTransaction = async (
  reference: string,
  expectedKobo: number,
  secretKey: string
): Promise<VerifiedTransaction> => {
  const transaction = await requestPaystack<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    'GET',
    secretKey
  );
  const transactionId = transaction.id === undefined ? '' : String(transaction.id);
  if (
    transaction.reference !== reference ||
    transaction.currency !== CURRENCY ||
    transaction.amount !== expectedKobo ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(transactionId) ||
    typeof transaction.status !== 'string'
  ) {
    throw new Error('Paystack transaction details do not match the saved payment attempt.');
  }
  return { transactionId, reference, status: transaction.status };
};

const applyVerifiedTransaction = async (
  reference: string,
  transaction: VerifiedTransaction,
  notificationHash?: string
): Promise<'processed' | 'duplicate' | 'not-found'> => {
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    const result = await client.query<PaymentAttemptRow>(
      `SELECT p.id, p.reservation_id, p.expected_amount, p.status, p.verified,
              p.provider_transaction_id, b.payment_status, b.status AS reservation_status
       FROM payment_attempts p
       JOIN reservations b ON b.id = p.reservation_id
       WHERE p.payment_reference = $1 AND p.payment_provider = 'paystack'
       FOR UPDATE OF p, b`,
      [reference]
    );
    const payment = result.rows[0];
    if (!payment) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return 'not-found';
    }

    if (notificationHash) {
      const inserted = await client.query(
        `INSERT INTO payment_notifications (payment_attempt_id, payload_hash)
         VALUES ($1, $2)
         ON CONFLICT (payload_hash) DO NOTHING
         RETURNING id`,
        [payment.id, notificationHash]
      );
      if (!inserted.rowCount) {
        await client.query('COMMIT');
        transactionOpen = false;
        return 'duplicate';
      }
    }

    if (
      payment.provider_transaction_id &&
      payment.provider_transaction_id !== transaction.transactionId
    ) {
      throw new Error('Paystack transaction ID does not match the saved payment attempt.');
    }

    let nextStatus: PaymentAttemptRow['status'] = 'pending';
    if (transaction.status === 'success') nextStatus = 'complete';
    else if (transaction.status === 'failed') nextStatus = 'failed';
    else if (transaction.status === 'abandoned') nextStatus = 'cancelled';

    await client.query(
      `UPDATE payment_attempts
       SET provider_transaction_id = COALESCE(provider_transaction_id, $1),
           verified = TRUE,
           status = CASE
             WHEN status = 'complete' THEN status
             WHEN $2 = 'complete' THEN 'complete'
             WHEN status = 'pending' THEN $2
             ELSE status
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [transaction.transactionId, nextStatus, payment.id]
    );

    if (nextStatus === 'complete') {
      await client.query(
        `UPDATE reservations
         SET payment_status = 'paid',
             status = CASE WHEN status = 'cancelled' THEN status ELSE 'confirmed' END
         WHERE id = $1 AND payment_status <> 'paid'`,
        [payment.reservation_id]
      );
    } else if (nextStatus === 'failed' || nextStatus === 'cancelled') {
      await client.query(
        `UPDATE reservations
         SET payment_status = $2
         WHERE id = $1 AND payment_status <> 'paid'`,
        [payment.reservation_id, nextStatus]
      );
    }

    await client.query('COMMIT');
    transactionOpen = false;
    return 'processed';
  } catch (error) {
    if (transactionOpen) {
      await client.query('ROLLBACK');
      transactionOpen = false;
    }
    throw error;
  } finally {
    client.release();
  }
};

export const createPaystackPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const reservationId = getReservationId(req.params.id);
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated.' });
    return;
  }
  if (!reservationId) {
    res.status(400).json({ error: 'A valid reservation is required.' });
    return;
  }

  let secretKey: string;
  try {
    secretKey = getPaystackSecretKey();
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Paystack Test Mode is not configured.',
    });
    return;
  }

  const client = await pool.connect();
  let transactionOpen = false;
  let attemptId: string | undefined;
  let expectedKobo: number | undefined;
  let email: string | undefined;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    const bookingResult = await client.query<{
      reservation_id: number;
      total_amount: string;
      payment_status: string;
      status: string;
      guest_email: string;
    }>(
      `SELECT b.id AS reservation_id, b.total_amount, b.payment_status, b.status,
              u.email AS guest_email
       FROM reservations b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = $1 AND b.user_id = $2
       FOR UPDATE OF b`,
      [reservationId, userId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }
    if (booking.payment_status === 'paid' || booking.status === 'confirmed') {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.status(409).json({ error: 'This reservation has already been paid or confirmed.' });
      return;
    }
    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.status(409).json({ error: 'This reservation has been cancelled.' });
      return;
    }
    if (!booking.guest_email) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.status(400).json({ error: 'A customer email address is required for payment.' });
      return;
    }

    expectedKobo = amountToKobo(booking.total_amount) ?? undefined;
    if (!expectedKobo) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      res.status(400).json({ error: 'The saved reservation amount is invalid.' });
      return;
    }
    email = booking.guest_email;

    const attemptResult = await client.query<{ payment_reference: string; expected_amount: string }>(
      `SELECT payment_reference, expected_amount
       FROM payment_attempts
       WHERE reservation_id = $1 AND payment_provider = 'paystack' AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [reservationId]
    );
    const existingAttempt = attemptResult.rows[0];
    if (existingAttempt && amountToKobo(existingAttempt.expected_amount) === expectedKobo) {
      attemptId = existingAttempt.payment_reference;
    } else {
      attemptId = randomUUID();
      await client.query(
        `INSERT INTO payment_attempts
           (id, reservation_id, payment_reference, expected_amount, payment_provider)
         VALUES ($1, $2, $1, $3, 'paystack')`,
        [attemptId, reservationId, (expectedKobo / 100).toFixed(2)]
      );
    }
    await client.query('COMMIT');
    transactionOpen = false;
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    console.error('Unable to prepare Paystack payment:', error);
    res.status(500).json({ error: 'Unable to prepare the payment.' });
    return;
  } finally {
    client.release();
  }

  if (!attemptId || !expectedKobo || !email) {
    res.status(500).json({ error: 'Unable to prepare the payment.' });
    return;
  }

  const configuredClientUrl = process.env.CLIENT_URL?.trim();
  if (!configuredClientUrl || configuredClientUrl.includes(',')) {
    res.status(503).json({ error: 'A single CLIENT_URL origin is required to initialize payment.' });
    return;
  }

  let callbackUrl: URL;
  try {
    const clientUrl = new URL(configuredClientUrl);
    if (!['https:', 'http:'].includes(clientUrl.protocol)) {
      throw new Error('CLIENT_URL must use HTTP or HTTPS.');
    }
    callbackUrl = new URL('/checkout', clientUrl.origin);
    callbackUrl.searchParams.set('reservation_id', String(reservationId));
    callbackUrl.searchParams.set('payment_ref', attemptId);
  } catch {
    res.status(503).json({ error: 'CLIENT_URL must be a valid absolute frontend URL.' });
    return;
  }

  try {
    const transaction = await requestPaystack<{
      authorization_url?: string;
      reference?: string;
    }>('/transaction/initialize', 'POST', secretKey, {
      email,
      amount: expectedKobo,
      currency: CURRENCY,
      reference: attemptId,
      callback_url: callbackUrl.toString(),
    });
    const authorizationUrl = transaction.authorization_url
      ? new URL(transaction.authorization_url)
      : null;
    if (
      authorizationUrl?.protocol !== 'https:' ||
      authorizationUrl.hostname !== 'checkout.paystack.com' ||
      transaction.reference !== attemptId
    ) {
      throw new Error('Paystack returned an invalid authorization URL or reference.');
    }
    res.status(200).json({
      success: true,
      authorizationUrl: authorizationUrl.toString(),
      reference: attemptId,
    });
  } catch (error) {
    console.error('Unable to initialize Paystack payment:', error);
    res.status(502).json({ error: 'Unable to initialize the Paystack payment. Please retry.' });
  }
};

export const getPaystackPaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const reservationId = getReservationId(req.params.id);
  const reference = getReference(req.params.paymentReference);
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated.' });
    return;
  }
  if (!reservationId || !reference) {
    res.status(400).json({ error: 'A valid reservation and payment reference are required.' });
    return;
  }

  try {
    const secretKey = getPaystackSecretKey();
    const attemptResult = await pool.query<{ expected_amount: string }>(
      `SELECT p.expected_amount
       FROM payment_attempts p
       JOIN reservations b ON b.id = p.reservation_id
       WHERE b.id = $1 AND b.user_id = $2
         AND p.payment_reference = $3 AND p.payment_provider = 'paystack'`,
      [reservationId, userId, reference]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      res.status(404).json({ error: 'Reservation payment was not found.' });
      return;
    }
    const expectedKobo = amountToKobo(attempt.expected_amount);
    if (!expectedKobo) {
      res.status(500).json({ error: 'The saved payment amount is invalid.' });
      return;
    }

    const transaction = await verifyPaystackTransaction(reference, expectedKobo, secretKey);
    const result = await applyVerifiedTransaction(reference, transaction);
    if (result === 'not-found') {
      res.status(404).json({ error: 'Reservation payment was not found.' });
      return;
    }
    const current = await pool.query(
      `SELECT b.id AS reservation_id, b.payment_status, b.status,
              p.status AS payment_attempt_status, p.verified, p.payment_reference
       FROM reservations b
       JOIN payment_attempts p ON p.reservation_id = b.id
       WHERE b.id = $1 AND b.user_id = $2
         AND p.payment_reference = $3 AND p.payment_provider = 'paystack'`,
      [reservationId, userId, reference]
    );
    res.status(200).json({
      success: true,
      data: current.rows[0],
      verifiedTransactionStatus: transaction.status,
    });
  } catch (error) {
    console.error('Unable to verify Paystack payment status:', error);
    const message = error instanceof Error ? error.message : '';
    const unavailable = message.includes('PAYSTACK_SECRET_KEY');
    res.status(unavailable ? 503 : 502).json({
      error: unavailable ? message : 'Unable to verify payment status with Paystack.',
    });
  }
};

const getRawRequestBody = (req: Request): Buffer | null =>
  Buffer.isBuffer(req.rawBody) ? req.rawBody : null;

const constantTimeHexMatch = (provided: string, expected: Buffer): boolean => {
  if (!/^[a-f0-9]+$/i.test(provided)) return false;
  const providedBytes = Buffer.from(provided, 'hex');
  return providedBytes.length === expected.length && timingSafeEqual(providedBytes, expected);
};

const verifyWebhookSignature = (req: Request, rawBody: Buffer): boolean => {
  const currentSignature = req.get('Paystack-Signature');
  if (currentSignature) {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET?.trim();

if (webhookSecret) {
  const [timestampPart, ...signatureParts] = currentSignature.split(',').map((part) => part.trim());
    const timestampMatch = /^t=(\d+)$/.exec(timestampPart ?? '');
    if (!timestampMatch || signatureParts.length === 0) return false;
    const timestamp = Number(timestampMatch[1]);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > MAX_WEBHOOK_AGE_SECONDS) {
      return false;
    }

    const signatures = signatureParts
      .map((part) => /^v1=([A-Za-z0-9_-]+):([a-f0-9]{128})$/i.exec(part))
      .filter((match): match is RegExpExecArray => match !== null);
    if (signatures.length !== signatureParts.length) return false;

    const expected = createHmac('sha512', webhookSecret)
      .update(`${timestamp}.`)
      .update(rawBody)
      .digest();
    let signatureMatched = false;
    for (const match of signatures) {
      signatureMatched = constantTimeHexMatch(match[2]!, expected) || signatureMatched;
    }
    return signatureMatched;
  }
  }
  const legacySignature = req.get('x-paystack-signature');
  if (!legacySignature) return false;
  let secretKey: string;
  try {
    secretKey = getPaystackSecretKey();
  } catch {
    return false;
  }
  const expected = createHmac('sha512', secretKey).update(rawBody).digest();
  return constantTimeHexMatch(legacySignature, expected);
};

export const receivePaystackNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawBody = getRawRequestBody(req);
  if (!rawBody || !verifyWebhookSignature(req, rawBody)) {
    res.status(401).json({ error: 'Invalid Paystack webhook signature.' });
    return;
  }

  let payload: {
    event?: unknown;
    data?: { reference?: unknown };
  };
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as typeof payload;
  } catch {
    res.status(400).json({ error: 'Invalid Paystack webhook payload.' });
    return;
  }

  if (!['charge.success', 'charge.failed', 'transaction.success'].includes(String(payload.event))) {
    res.status(200).json({ received: true });
    return;
  }

  const reference = getReference(payload.data?.reference);
  if (!reference) {
    res.status(400).json({ error: 'A valid Paystack transaction reference is required.' });
    return;
  }

  try {
    const secretKey = getPaystackSecretKey();
    const attemptResult = await pool.query<{ expected_amount: string }>(
      `SELECT expected_amount
       FROM payment_attempts
       WHERE payment_reference = $1 AND payment_provider = 'paystack'`,
      [reference]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt) {
      res.status(404).json({ error: 'Paystack payment attempt was not found.' });
      return;
    }
    const expectedKobo = amountToKobo(attempt.expected_amount);
    if (!expectedKobo) {
      res.status(400).json({ error: 'The saved payment amount is invalid.' });
      return;
    }

    const transaction = await verifyPaystackTransaction(reference, expectedKobo, secretKey);
    const result = await applyVerifiedTransaction(
      reference,
      transaction,
      createHash('sha256').update(rawBody).digest('hex')
    );
    if (result === 'not-found') {
      res.status(404).json({ error: 'Paystack payment attempt was not found.' });
      return;
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Unable to process Paystack notification:', error);
    res.status(502).json({ error: 'Unable to verify the Paystack notification.' });
  }
};
