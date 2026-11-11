import { Router } from 'express'; 
import passport from '../config/passport.js'; 
import { exchangeGoogleAuthCode, googleCallback, getCurrentuser, loginWithEmail, registerWithEmail } from '../controllers/authController.js';
import type { RequestHandler } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { getClientUrl } from '../config/env.js';

const router = Router(); 
const clientUrl = getClientUrl();
const googleFailureUrl = new URL('/auth/callback#error=google_auth_failed', clientUrl).toString();
const googleStateCookie = 'google_oauth_state';
const cookiePath = '/api/auth/google/callback';
const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';

router.post('/register', registerWithEmail);
router.post('/login', loginWithEmail);
router.post('/google/exchange', exchangeGoogleAuthCode);
router.get('/google', (req, res, next) => {
    const state = randomBytes(32).toString('base64url');
    res.setHeader(
        'Set-Cookie',
        `${googleStateCookie}=${state}; HttpOnly; SameSite=Lax; Path=${cookiePath}; Max-Age=300${secureCookie}`
    );
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state,
    })(req, res, next);
});
router.get(
    '/google/callback',
    ((req, res, next) => {
        const queryState = typeof req.query.state === 'string' ? req.query.state : '';
        const cookieHeader = req.headers.cookie || '';
        const cookieState = cookieHeader
            .split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(`${googleStateCookie}=`))
            ?.slice(googleStateCookie.length + 1) || '';

        res.setHeader(
            'Set-Cookie',
            `${googleStateCookie}=; HttpOnly; SameSite=Lax; Path=${cookiePath}; Max-Age=0${secureCookie}`
        );

        const queryBuffer = Buffer.from(queryState);
        const cookieBuffer = Buffer.from(cookieState);
        if (
            !queryState ||
            queryBuffer.length !== cookieBuffer.length ||
            !timingSafeEqual(queryBuffer, cookieBuffer)
        ) {
            console.warn('google_oauth_state_rejected: missing or mismatched state');
            res.redirect(googleFailureUrl);
            return;
        }

        const authenticate: RequestHandler = passport.authenticate(
            'google',
            { session: false },
            (error, user) => {
                if (error) {
                    console.error('google_oauth_passport_callback_failed', {
                        errorName: error instanceof Error ? error.name : 'UnknownError',
                    });
                    res.redirect(googleFailureUrl);
                    return;
                }
                if (!user) {
                    console.warn('google_oauth_passport_callback_returned_no_user');
                    res.redirect(googleFailureUrl);
                    return;
                }

                req.user = user;
                googleCallback(req, res);
            }
        );
        authenticate(req, res, next);
    }) as RequestHandler
);
router.get('/me', getCurrentuser); 

export default router;