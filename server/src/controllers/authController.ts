import type {Request, Response} from 'express' //always write type
import jwt from 'jsonwebtoken'
import {pool} from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'breakaway_jwt_secret_key_2026';

//Handles the Google OAuth callback by generating a signed JWT token and redirects back to the React frontend.
export const googleCallback = (req: Request, res: Response): void => {
    try {
        const user = req.user as any;

        if(!user){
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
            return;
        };

        //Sign JWT token containing user ID, email and role
        const token = jwt.sign(
            {id: user.id, email: user.email, role: user.role},
            JWT_SECRET,
            {expiresIn: '7d'}
        );

        //Redirect to frontend with JWT token in query parameter
        const redirectURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}'}`;
        res.redirect(redirectURL);
    } catch (error) {
        console.error('Error in googleCallback:', error);
        res.status(500).json({error: 'Authentication callback failed'});
    }
};

//GET api/auth/me. It retrieves the current authenticated user profile details from JWT token.
