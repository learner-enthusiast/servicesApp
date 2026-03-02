import { Request, Response, NextFunction } from 'express';

export type UserTypeInterface = 'CUSTOMER' | 'SERVICE_PROVIDER';

/**
 * Middleware to check if the authenticated user matches the required role ('admin' or 'user').
 * Usage: app.use(checkRole('admin')) or app.use(checkRole('user'))
 */
const checkUserType = (userType: UserTypeInterface) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !req.auth.role) {
      res.status(401).json({ message: 'Unauthorized: No auth info found.' });
      return;
    }
    if (req.auth.type !== userType) {
      res.status(403).json({ message: `Forbidden: Requires ${userType} userType.` });
      return;
    }
    next();
  };
};

export default checkUserType;
