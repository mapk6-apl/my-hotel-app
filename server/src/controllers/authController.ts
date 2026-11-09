import type {Request, Response} from 'express' //always write type
import jwt from 'jsonwebtoken'
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import {pool} from '../config/db.js'
import { getClientUrl, getJwtSecret } from '../config/env.js'

const PASSWORD_HASH_BYTES = 64;
const GOOGLE_AUTH_CODE_TTL_MS = 60_000;
const googleAuthCodes = new Map<string, { userId: number; expiresAt: number }>();

type AuthenticatedProfile = {
    id: number;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: 'guest' | 'admin';
};

type LocalUser = AuthenticatedProfile & {
    password_hash: string | null;
};

const derivePasswordHash = (password: string, salt: Buffer): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        scrypt(password, salt, PASSWORD_HASH_BYTES, (error, derivedKey) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(derivedKey);
        });
    });

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16);
    const derivedKey = await derivePasswordHash(password, salt);
    return `scrypt$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    const [algorithm, encodedSalt, encodedHash] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !encodedSalt || !encodedHash) {
        return false;
    }

    const salt = Buffer.from(encodedSalt, 'base64');
    const expectedHash = Buffer.from(encodedHash, 'base64');
    if (salt.length !== 16 || expectedHash.length !== PASSWORD_HASH_BYTES) {
        return false;
    }

    const actualHash = await derivePasswordHash(password, salt);
    return timingSafeEqual(actualHash, expectedHash);
};

const createAuthResponse = (user: AuthenticatedProfile) => ({
    success: true,
    token: jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: '7d' }
    ),
    user,
});

export const registerWithEmail = async (req: Request, res: Response): Promise<void> => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'Registration details are required.' });
        return;
    }

    const { email, password, full_name } = body as Record<string, unknown>;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof full_name === 'string' ? full_name.trim() : '';

    if (
        !normalizedEmail ||
        normalizedEmail.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
        res.status(400).json({ error: 'Enter a valid email address.' });
        return;
    }
    if (!normalizedName || normalizedName.length > 255) {
        res.status(400).json({ error: 'Enter your name (up to 255 characters).' });
        return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
        return;
    }

    try {
        const existingUser = await pool.query<{ id: number }>(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
            [normalizedEmail]
        );
        if (existingUser.rows.length > 0) {
            res.status(409).json({ error: 'An account with this email address already exists.' });
            return;
        }

        const passwordHash = await hashPassword(password);
        const result = await pool.query<AuthenticatedProfile>(
            `INSERT INTO users (oauth_provider, oauth_id, email, full_name, role, password_hash)
             VALUES ('local', $1, $2, $3, 'guest', $4)
             RETURNING id, email, full_name, avatar_url, role`,
            [randomUUID(), normalizedEmail, normalizedName, passwordHash]
        );
        const user = result.rows[0];
        if (!user) {
            throw new Error('Registration did not return the created user.');
        }

        res.status(201).json(createAuthResponse(user));
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === '23505'
        ) {
            res.status(409).json({ error: 'An account with this email address already exists.' });
            return;
        }
        console.error('Error registering email account:', error);
        res.status(500).json({ error: 'Unable to create your account. Please try again.' });
    }
};

export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
    }

    const { email, password } = body as Record<string, unknown>;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (
        !normalizedEmail ||
        normalizedEmail.length > 255 ||
        typeof password !== 'string' ||
        !password ||
        password.length > 128
    ) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
    }

    try {
        const result = await pool.query<LocalUser>(
            `SELECT id, email, full_name, avatar_url, role, password_hash
             FROM users
             WHERE LOWER(email) = LOWER($1)
             LIMIT 1`,
            [normalizedEmail]
        );
        const user = result.rows[0];
        if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }

        const profile: AuthenticatedProfile = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
        };
        res.status(200).json(createAuthResponse(profile));
    } catch (error) {
        console.error('Error logging in with email:', error);
        res.status(500).json({ error: 'Unable to sign in right now. Please try again.' });
    }
};

const getFrontendAuthCallbackUrl = (query: string): string =>
    new URL(`/auth/callback${query}`, getClientUrl()).toString();

export const googleCallback = (req: Request, res: Response): void => {
    const user = req.user as { id?: number } | undefined;
    if (!user || !Number.isInteger(user.id)) {
        res.redirect(getFrontendAuthCallbackUrl('#error=google_auth_failed'));
        return;
    }

    const now = Date.now();
    for (const [code, entry] of googleAuthCodes) {
        if (entry.expiresAt <= now) {
            googleAuthCodes.delete(code);
        }
    }

    const code = randomBytes(32).toString('base64url');
    googleAuthCodes.set(code, { userId: user.id!, expiresAt: now + GOOGLE_AUTH_CODE_TTL_MS });
    res.redirect(getFrontendAuthCallbackUrl(`#code=${encodeURIComponent(code)}`));
};

export const exchangeGoogleAuthCode = async (req: Request, res: Response): Promise<void> => {
    const code = req.body && typeof req.body.code === 'string' ? req.body.code : '';
    if (!/^[A-Za-z0-9_-]{43}$/.test(code)) {
        res.status(400).json({ error: 'A valid Google authentication code is required.' });
        return;
    }

    const entry = googleAuthCodes.get(code);
    googleAuthCodes.delete(code);
    if (!entry || entry.expiresAt <= Date.now()) {
        res.status(401).json({ error: 'Google sign-in code is invalid or expired. Please try again.' });
        return;
    }

    try {
        const result = await pool.query<AuthenticatedProfile>(
            `SELECT id, email, full_name, avatar_url, role
             FROM users
             WHERE id = $1`,
            [entry.userId]
        );
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Google account could not be found. Please sign in again.' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            getJwtSecret(),
            { expiresIn: '7d' }
        );
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Error exchanging Google authentication code:', error);
        res.status(500).json({ error: 'Unable to complete Google sign-in. Please try again.' });
    }
};

//GET api/auth/me. It retrieves the current authenticated user profile details from JWT token.
export const getCurrentuser = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            res.status(401).json({error: 'Unauthorized: Missing or malformed token'});
            return;
        }

        const token = authHeader.split(' ')[1];
        if(!token) {
            res.status(401).json({error: 'Unauthorized: Token missing'});
            return; 
        }
        const decoded = jwt.verify(token, getJwtSecret()) as unknown as {id: number};
        const userQuery = 'SELECT id, email, full_name, avatar_url, role, phone, created_at FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [decoded.id]);

        if(userResult.rows.length === 0){
            res.status(404).json({error: 'User profile not found'});
            return;
        }

        res.status(200).json({
            success: true,
            user: userResult.rows[0],
        });
    } catch (error) {
        res.status(401).json({error: 'Invalid or expired token'});
    }
};