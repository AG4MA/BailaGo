import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
import { User } from '../types/index.js';
import { accountInactivityService } from '../services/accountInactivity.js';

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Token mancante' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    
    const user = db.users.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'Utente non trovato' });
      return;
    }

    // Check if account is deleted
    if (user.status === 'deleted') {
      res.status(403).json({ success: false, error: 'Account eliminato' });
      return;
    }

    // Update last active timestamp (reactivates deactivated accounts)
    await accountInactivityService.updateLastActive(user.id);

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token non valido' });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      
      const user = db.users.findById(decoded.userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      }
    }
    
    next();
  } catch {
    // Token non valido, continua senza autenticazione
    next();
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  } as jwt.SignOptions);
};
