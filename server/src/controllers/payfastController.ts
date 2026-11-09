import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { Request, Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

type PayFastFields = Record<string, string>;

type PayFastConfig = {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  sourceIps: string[];
  processUrl: string;
  validationUrl: string;
};

const SANDBOX_URL = 'https://sandbox.payfast.co.za';
const PAYFAST_PROCESS_PATH = '/eng/process';
const PAYFAST_VALIDATE_PATH = '/eng/query/validate';

const encodePayFastValue = (value: string): string =>
  encodeURIComponent(value.trim())
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);

export const createPayFastSignature = (
  fields: PayFastFields,
  passphrase: string
): string => {
  const parameters = Object.entries(fields)
    .filter(([key]) => key !== 'signature')
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join('&');
  const signedParameters = passphrase
    ? `${parameters}&passphrase=${encodePayFastValue(passphrase)}`
    : parameters;
  return createHash('md5').update(signedParameters).digest('hex');
};

const signatureMatches = (fields: PayFastFields, passphrase: string): boolean => {
  const supplied = fields.signature;
  if (!supplied || !/^[a-f0-9]{32}$/i.test(supplied)) return false;
  const expected = createPayFastSignature(fields, passphrase);
  const suppliedBytes = Buffer.from(supplied.toLowerCase(), 'hex');
  const expectedBytes = Buffer.from(expected, 'hex');
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
};

const configuredUrl = (name: string, value: string | undefined, requireHttps: boolean): string => {
  if (!value) throw new Error(`${name} is not configured.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
  if (requireHttps && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS.`);
  }
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  return url.toString();
};

const getPayFastConfig = (): PayFastConfig => {
  if (process.env.PAYFAST_MODE !== 'sandbox') {
    throw new Error('PAYFAST_MODE must be set to sandbox; live payments are disabled.');
  }
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  if (!merchantId || !merchantKey || !passphrase) {
    throw new Error('PayFast sandbox credentials are not fully configured on the server.');
  }
  const sourceIps = (process.env.PAYFAST_SOURCE_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  if (sourceIps.length === 0 || sourceIps.some((range) => !isValidIpv4Cidr(range))) {
    throw new Error('Configure PAYFAST_SOURCE_IPS with the current source IPs/CIDRs published by PayFast.');
  }
  return {
    merchantId,
    merchantKey,
    passphrase,
    returnUrl: configuredUrl('PAYFAST_RETURN_URL', process.env.PAYFAST_RETURN_URL, process.env.NODE_ENV === 'production'),
    cancelUrl: configuredUrl('PAYFAST_CANCEL_URL', process.env.PAYFAST_CANCEL_URL, process.env.NODE_ENV === 'production'),
    notifyUrl: configuredUrl('PAYFAST_NOTIFY_URL', process.env.PAYFAST_NOTIFY_URL, true),
    sourceIps,
    processUrl: `${SANDBOX_URL}${PAYFAST_PROCESS_PATH}`,
    validationUrl: `${SANDBOX_URL}${PAYFAST_VALIDATE_PATH}`,
  };
};

const ipv4ToNumber = (address: string): number | null => {
  if (isIP(address) !== 4) return null;
  return address.split('.').reduce((result, octet) => ((result << 8) | Number(octet)) >>> 0, 0);
};

const isValidIpv4Cidr = (range: string): boolean => {
  const [address, prefixText] = range.split('/');
  const prefix = prefixText === undefined ? 32 : Number(prefixText);
  return Boolean(address && ipv4ToNumber(address) !== null && Number.isInteger(prefix) && prefix >= 0 && prefix <= 32);
};

export const isAllowedPayFastIp = (address: string, ranges: string[]): boolean => {
  const normalizedAddress = address.startsWith('::ffff:') ? address.slice(7) : address;
  const remote = ipv4ToNumber(normalizedAddress);
  if (remote === null) return false;
  return ranges.some((range) => {
    const [networkText, prefixText] = range.split('/');
    if (!networkText) return false;
    const network = ipv4ToNumber(networkText);
    if (network === null) return false;
    const prefix = prefixText === undefined ? 32 : Number(prefixText);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (remote & mask) === (network & mask);
  });
};

const parseFields = (body: unknown): PayFastFields | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const fields: PayFastFields = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string' || key.length > 100 || value.length > 4000) return null;
    fields[key] = value;
  }
  return fields;
};

const validateWithPayFast = async (
  fields: PayFastFields,
  config: PayFastConfig
): Promise<boolean> => {
  const body = new URLSearchParams(fields);
  const response = await fetch(config.validationUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return false;
  return (await response.text()).trim() === 'VALID';
};

const addReturnParameters = (configured: string, reservationId: number, reference: string, result: string): string => {
  const url = new URL(configured);
  url.searchParams.set('reservation_id', String(reservationId));
  url.searchParams.set('payment_ref', reference);
  url.searchParams.set('payment_result', result);
  return url.toString();
};

const formatAmount = (value: string | number): string => Number(value).toFixed(2);
const paymentReferencePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createPayFastPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reservationId = Number(req.params.id);
  const userId = req.user?.id;
  if (!Number.isInteger(reservationId) || reservationId <= 0 || !userId) {
    res.status(400).json({ error: 'A valid reservation is required.' });
    return;
  }

  let config: PayFastConfig;
  try {
    config = getPayFastConfig();
  } catch (error) {
    res.status(503).json({ error: error instanceof Error ? error.message : 'PayFast sandbox is not configured.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingResult = await client.query<{
      reservation_id: number;
      total_amount: string;
      payment_status: string;
      status: string;
      guest_email: string;
      guest_name: string;
      hotel_name: string;
    }>(
      `SELECT b.id AS reservation_id, b.total_amount, b.payment_status, b.status,
              u.email AS guest_email, u.full_name AS guest_name, a.name AS hotel_name
       FROM reservations b
       JOIN users u ON u.id = b.user_id
       JOIN rooms r ON r.id = b.room_id
       JOIN accommodations a ON a.id = r.accommodation_id
       WHERE b.id = $1 AND b.user_id = $2
       FOR UPDATE OF b`,
      [reservationId, userId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }
    if (booking.payment_status === 'paid' || booking.status === 'confirmed') {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'This reservation has already been paid.' });
      return;
    }
    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'This reservation has been cancelled.' });
      return;
    }

    const pendingResult = await client.query<{ id: string }>(
      `SELECT id FROM payment_attempts
       WHERE reservation_id = $1 AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [reservationId]
    );
    const attemptId = pendingResult.rows[0]?.id ?? randomUUID();
    if (!pendingResult.rows[0]) {
      await client.query(
        `INSERT INTO payment_attempts (id, reservation_id, payment_reference, expected_amount)
         VALUES ($1, $2, $1, $3)`,
        [attemptId, reservationId, formatAmount(booking.total_amount)]
      );
    }
    await client.query('COMMIT');

    const returnUrl = addReturnParameters(config.returnUrl, reservationId, attemptId, 'return');
    const cancelUrl = addReturnParameters(config.cancelUrl, reservationId, attemptId, 'cancelled');
    const fields: PayFastFields = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: config.notifyUrl,
      name_first: booking.guest_name.split(/\s+/)[0] || 'Guest',
      name_last: booking.guest_name.split(/\s+/).slice(1).join(' ') || 'Guest',
      email_address: booking.guest_email,
      m_payment_id: attemptId,
      amount: formatAmount(booking.total_amount),
      item_name: `Reservation ${reservationId}`,
      item_description: booking.hotel_name.slice(0, 255),
    };
    fields.signature = createPayFastSignature(fields, config.passphrase);
    res.status(200).json({ success: true, action: config.processUrl, fields });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unable to prepare PayFast sandbox payment:', error);
    res.status(500).json({ error: 'Unable to prepare the sandbox payment.' });
  } finally {
    client.release();
  }
};

export const getPayFastPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reservationId = Number(req.params.id);
  const paymentReference = typeof req.params.paymentReference === 'string'
    ? req.params.paymentReference
    : '';
  const userId = req.user?.id;
  if (!Number.isInteger(reservationId) || reservationId <= 0 || !userId || !paymentReferencePattern.test(paymentReference)) {
    res.status(400).json({ error: 'A valid reservation and payment reference are required.' });
    return;
  }
  try {
    const result = await pool.query(
      `SELECT b.id AS reservation_id, b.room_id, b.check_in, b.check_out, b.guest_count,
              b.total_amount, b.payment_status, b.status, b.created_at,
              u.full_name AS guest_name, u.email AS guest_email,
              r.room_type, r.price_per_night, a.id AS accommodation_id,
              a.name AS hotel_name, a.city, a.address,
              (SELECT image_url FROM accommodation_images
               WHERE accommodation_id = a.id AND is_hero = TRUE
               ORDER BY id ASC LIMIT 1) AS hero_image,
              p.status AS payment_attempt_status, p.verified AS payment_verified,
              p.payment_reference
       FROM reservations b
       JOIN users u ON u.id = b.user_id
       JOIN rooms r ON r.id = b.room_id
       JOIN accommodations a ON a.id = r.accommodation_id
       JOIN payment_attempts p ON p.reservation_id = b.id
       WHERE b.id = $1 AND b.user_id = $2 AND p.payment_reference = $3`,
      [reservationId, userId, paymentReference]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: 'Reservation payment was not found.' });
      return;
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Unable to fetch PayFast payment status:', error);
    res.status(500).json({ error: 'Unable to fetch payment status.' });
  }
};

export const receivePayFastNotification = async (req: Request, res: Response): Promise<void> => {
  let config: PayFastConfig;
  try {
    config = getPayFastConfig();
  } catch (error) {
    res.status(503).type('text/plain').send(error instanceof Error ? error.message : 'PayFast is not configured.');
    return;
  }

  const remoteAddress = req.ip || req.socket.remoteAddress || '';
  if (!isAllowedPayFastIp(remoteAddress, config.sourceIps)) {
    res.status(403).type('text/plain').send('Source IP rejected');
    return;
  }
  const fields = parseFields(req.body);
  const paymentReference = fields?.m_payment_id || '';
  const providerPaymentId = fields?.pf_payment_id || '';
  const paymentStatus = fields?.payment_status || '';
  if (
    !fields ||
    !signatureMatches(fields, config.passphrase) ||
    fields.merchant_id !== config.merchantId ||
    !paymentReferencePattern.test(paymentReference) ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(providerPaymentId) ||
    !['COMPLETE', 'FAILED', 'CANCELLED', 'PENDING'].includes(paymentStatus)
  ) {
    res.status(400).type('text/plain').send('Invalid notification');
    return;
  }

  try {
    if (!(await validateWithPayFast(fields, config))) {
      res.status(400).type('text/plain').send('PayFast validation failed');
      return;
    }
  } catch (error) {
    console.error('PayFast notification validation endpoint unavailable:', error);
    res.status(502).type('text/plain').send('Notification validation unavailable');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const paymentResult = await client.query<{
      id: string;
      reservation_id: number;
      expected_amount: string;
      status: string;
      payment_status: string;
      reservation_status: string;
    }>(
      `SELECT p.id, p.reservation_id, p.expected_amount, p.status,
              b.payment_status, b.status AS reservation_status
       FROM payment_attempts p
       JOIN reservations b ON b.id = p.reservation_id
       WHERE p.payment_reference = $1
       FOR UPDATE OF p, b`,
      [paymentReference]
    );
    const payment = paymentResult.rows[0];
    const notifiedCents = Math.round(Number(fields.amount_gross) * 100);
    const expectedCents = payment ? Math.round(Number(payment.expected_amount) * 100) : -1;
    if (!payment || !Number.isFinite(notifiedCents) || notifiedCents !== expectedCents) {
      await client.query('ROLLBACK');
      res.status(400).type('text/plain').send('Payment reference or amount mismatch');
      return;
    }

    const payloadHash = createHash('sha256')
      .update(new URLSearchParams(fields).toString())
      .digest('hex');
    const notification = await client.query(
      `INSERT INTO payment_notifications (payment_attempt_id, payload_hash)
       VALUES ($1, $2)
       ON CONFLICT (payload_hash) DO NOTHING
       RETURNING id`,
      [payment.id, payloadHash]
    );
    if (!notification.rowCount) {
      await client.query('COMMIT');
      res.status(200).type('text/plain').send('OK');
      return;
    }

    await client.query(
      `UPDATE payment_attempts
       SET payfast_payment_id = COALESCE(payfast_payment_id, $1),
           verified = TRUE,
           status = CASE
             WHEN status = 'complete' THEN status
             WHEN $2 = 'COMPLETE' THEN 'complete'
             WHEN $2 = 'FAILED' THEN 'failed'
             WHEN $2 = 'CANCELLED' THEN 'cancelled'
             ELSE 'pending'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [providerPaymentId, paymentStatus, payment.id]
    );

    if (paymentStatus === 'COMPLETE' && payment.payment_status !== 'paid') {
      await client.query(
        `UPDATE reservations
         SET payment_status = 'paid',
             status = CASE WHEN status = 'cancelled' THEN status ELSE 'confirmed' END
         WHERE id = $1 AND payment_status <> 'paid'`,
        [payment.reservation_id]
      );
    } else if (['FAILED', 'CANCELLED'].includes(paymentStatus) && payment.payment_status !== 'paid') {
      const nextStatus = paymentStatus === 'FAILED' ? 'failed' : 'cancelled';
      await client.query(
        `UPDATE reservations
         SET payment_status = $2
         WHERE id = $1 AND payment_status <> 'paid'`,
        [payment.reservation_id, nextStatus]
      );
    }

    await client.query('COMMIT');
    res.status(200).type('text/plain').send('OK');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unable to process PayFast notification:', error);
    res.status(500).type('text/plain').send('Notification processing failed');
  } finally {
    client.release();
  }
};
