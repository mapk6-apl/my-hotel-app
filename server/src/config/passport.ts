import passport from 'passport'; 
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; 
import { pool } from './db.js'; 

const logGoogleStrategyError = (error: unknown): void => {
    const errorCode =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string' &&
        /^[A-Z0-9]{5}$/.test(error.code)
            ? error.code
            : undefined;
    console.error('google_oauth_profile_lookup_failed', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        ...(errorCode ? { errorCode } : {}),
    });
};

passport.use( 
    new GoogleStrategy( 
        { 
            clientID: process.env.GOOGLE_CLIENT_ID || '', 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', 
            callbackURL: process.env.GOOGLE_CALLBACK_URL ||
                (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001/api/auth/google/callback'),
        }, 
        async (_accessToken: string, refreshToken, profile, done) => {
             try { 
                const googleId = profile.id; 
                const email = profile.emails?.[0]?.value || ''; 
                const fullName = profile.displayName || 'Guest User'; 
                const avatarUrl = profile.photos?.[0]?.value || ''; 

                //1. Check if user already exists in PostgreSQL 
                const userQuery = 'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2'; 
                const existingUser = await pool.query(userQuery, ['google', googleId]); 
                if (existingUser.rows.length > 0) { 
                    return done(null, existingUser.rows[0]); 
                } 
                
                // 2. If new user, insert into PostgreSQL database 
                const insertQuery = ` INSERT INTO users (oauth_provider, oauth_id, email, full_name, avatar_url, role) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING * `; 
                const newUser = await pool.query(insertQuery, [ 'google', googleId, email, fullName, avatarUrl, 'guest', // Default role 
                ]); 
                return done(null, newUser.rows[0]); 
            } catch (error) { 
                logGoogleStrategyError(error);
                return done(error as Error, undefined); 
            } 
        } 
    ) 
); 

export default passport;