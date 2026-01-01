import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  userId?: string;
}

// Cached user ID to avoid repeated DB calls
let cachedUserId: string | null = null;

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    // Use cached user if available
    if (cachedUserId) {
      req.userId = cachedUserId;
      return next();
    }

    // Find or create default user
    let user = await prisma.user.findFirst();

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'usuario@voyra.com',
          name: 'Usuário Voyra',
          password: 'not-used',
        },
      });
    }

    cachedUserId = user.id;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
}
