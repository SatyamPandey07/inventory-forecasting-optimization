import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  orgId?: string;
  userId?: string;
  role?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Inject demo tenant context for seamless operation
  req.orgId = req.headers['x-org-id'] as string || '11111111-1111-1111-1111-111111111111';
  req.userId = '22222222-2222-2222-2222-222222222222';
  req.role = 'admin';
  next();
};
