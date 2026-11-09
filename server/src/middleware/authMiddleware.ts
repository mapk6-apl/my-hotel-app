//This middleware verifies incoming JWT Bearer tokens and attaches the authenticated user profile (req.user) to protected requests.
import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../config/env.js'

//extend Express Request to include user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

//this middleware protects private API endpoints
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
        res.status(401).json({error: 'Unauthorized: Missing or malformed token'});
        return;
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        res.status(401).json({error: 'Unauhorized: Token missing'});
        return;
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as unknown as {
            id: number;
            email: string;
            role: string;
        };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error: 'Invalid or expired authentication token'});
    }
};