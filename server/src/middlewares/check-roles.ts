import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user matches the required role ('admin' or 'user').
 * Usage: app.use(checkRole('admin')) or app.use(checkRole('user'))
 */
const checkRole = (role: 'admin' | 'user') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !req.auth.role) {
      res.status(401).json({ message: 'Unauthorized: No auth info found.' });
      return;
    }
    if (req.auth.role !== role) {
      res.status(403).json({ message: `Forbidden: Requires ${role} role.` });
      return;
    }
    next();
  };
};

export default checkRole;
