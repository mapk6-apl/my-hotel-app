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

  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CLIENT_URL is required in production.');
    }
    return 'http://localhost:5173';
  }

  const origins = configured.split(',').map((origin) => origin.trim()).filter(Boolean);

  if (origins.length !== 1) {
    throw new Error('CLIENT_URL must contain exactly one origin for payment callbacks.');
  }

  const url = parseAbsoluteUrl(
    'CLIENT_URL',
    origins[0]!,
    process.env.NODE_ENV === 'production'
  );

  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('CLIENT_URL must contain only the frontend origin, without a path or query.');
  }

  return url.origin;
};

export const validateProductionEnvironment = (): void => {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'JWT_SECRET',
    'CLIENT_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'UNSPLASH_ACCESS_KEY',
    'PAYSTACK_SECRET_KEY',
  ];

  const missing = required.filter((name) => !process.env[name]?.trim());

  if (!process.env.HOTEL_DATABASE_URL?.trim() && !process.env.DATABASE_URL?.trim()) {
    missing.push('HOTEL_DATABASE_URL or DATABASE_URL');
  }

  if (missing.length) {
    throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  }

  getJwtSecret();

  if (!process.env.PAYSTACK_SECRET_KEY!.trim().startsWith('sk_test_')) {
    throw new Error('PAYSTACK_SECRET_KEY must be a Paystack Test Mode key. Live payments are disabled.');
  }

getClientUrl();

  const callbackUrl = parseAbsoluteUrl(
    'GOOGLE_CALLBACK_URL',
    process.env.GOOGLE_CALLBACK_URL!,
    true
  );

  if (callbackUrl.pathname !== '/api/auth/google/callback') {
    throw new Error('GOOGLE_CALLBACK_URL must end in /api/auth/google/callback.');
  }
  if (callbackUrl.origin !== getClientUrl()) {
    throw new Error('GOOGLE_CALLBACK_URL must use the same origin as CLIENT_URL.');
  }
};
