import { isIP } from 'node:net';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required.');
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
  return secret;
};

const parseAbsoluteUrl = (name: string, value: string, httpsOnly: boolean): URL => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL.`);
  }
  if (httpsOnly && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS in production.`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  return url;
};

export const getClientUrl = (): string => {
  const configured = process.env.CLIENT_URL;
  if (configured) return configured.split(',')[0]!.trim();
  if (process.env.NODE_ENV === 'production') throw new Error('CLIENT_URL is required in production.');
  return 'http://localhost:5173';
};

export const validateProductionEnvironment = (): void => {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CLIENT_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'UNSPLASH_ACCESS_KEY',
    'PAYFAST_MODE',
    'PAYFAST_MERCHANT_ID',
    'PAYFAST_MERCHANT_KEY',
    'PAYFAST_PASSPHRASE',
    'PAYFAST_RETURN_URL',
    'PAYFAST_CANCEL_URL',
    'PAYFAST_NOTIFY_URL',
    'PAYFAST_SOURCE_IPS',
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  }
  getJwtSecret();
  if (process.env.PAYFAST_MODE !== 'sandbox') {
    throw new Error('PAYFAST_MODE must be sandbox; live payments are disabled.');
  }

  const clientOrigins = process.env.CLIENT_URL!.split(',').map((origin) =>
    parseAbsoluteUrl('CLIENT_URL', origin.trim(), true).origin
  );
  const callbackUrl = parseAbsoluteUrl('GOOGLE_CALLBACK_URL', process.env.GOOGLE_CALLBACK_URL!, true);
  const returnUrl = parseAbsoluteUrl('PAYFAST_RETURN_URL', process.env.PAYFAST_RETURN_URL!, true);
  const cancelUrl = parseAbsoluteUrl('PAYFAST_CANCEL_URL', process.env.PAYFAST_CANCEL_URL!, true);
  const notifyUrl = parseAbsoluteUrl('PAYFAST_NOTIFY_URL', process.env.PAYFAST_NOTIFY_URL!, true);
  if (callbackUrl.pathname !== '/api/auth/google/callback') {
    throw new Error('GOOGLE_CALLBACK_URL must end in /api/auth/google/callback.');
  }
  if (
    !clientOrigins.includes(returnUrl.origin) ||
    !clientOrigins.includes(cancelUrl.origin) ||
    !['/checkout', '/checkout/'].includes(returnUrl.pathname) ||
    !['/checkout', '/checkout/'].includes(cancelUrl.pathname)
  ) {
    throw new Error('PayFast return and cancel URLs must use CLIENT_URL and the /checkout route.');
  }
  if (notifyUrl.pathname !== '/api/bookings/payfast/notify') {
    throw new Error('PAYFAST_NOTIFY_URL must end in /api/bookings/payfast/notify.');
  }

  const sourceRanges = process.env.PAYFAST_SOURCE_IPS!.split(',').map((range) => range.trim());
  const validSourceRange = sourceRanges.every((range) => {
    const [address, prefixText] = range.split('/');
    const prefix = prefixText === undefined ? 32 : Number(prefixText);
    return Boolean(
      address &&
      isIP(address) === 4 &&
      Number.isInteger(prefix) &&
      prefix >= 0 &&
      prefix <= 32
    );
  });
  if (!validSourceRange) {
    throw new Error('PAYFAST_SOURCE_IPS must contain valid IPv4 addresses or CIDR ranges.');
  }
};
