import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  userId?: string;
}

// Default user ID - will be created if not exists
const DEFAULT_USER_ID = 'default-user-id';

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    // Check if default user exists, create if not
    let user = await prisma.user.findFirst();

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: 'usuario@voyra.com',
          name: 'Usuário Voyra',
          password: 'not-used',
        },
      });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    // If any error, just use a default ID
    req.userId = DEFAULT_USER_ID;
    next();
  }
}
