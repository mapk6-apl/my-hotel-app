import type {Response, NextFunction} from 'express'
import type {AuthenticatedRequest} from './authMiddleware.js'

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if(!req.user || req.user.role !== 'admin'){
        res.status(403).json({error: 'Access denied: Admin privileges required'});
        return;
    }
    next();
};