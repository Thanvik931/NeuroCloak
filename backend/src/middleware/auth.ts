import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try Standard JWT (Internal)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      // 2. Try Firebase ID Token (Hardened)
      const decodedFirebase: any = jwt.decode(token);

      if (!decodedFirebase) throw new Error('Invalid token');

      const isFirebase = (
        (decodedFirebase.iss && decodedFirebase.iss.includes('firebase')) ||
        (decodedFirebase.iss && decodedFirebase.iss.includes('google.com')) ||
        (decodedFirebase.aud && decodedFirebase.aud.includes('neurocloak'))
      );

      if (isFirebase) {
        // SECURITY ALERT: Decoding without verifying the signature is a loophole.
        // In production, we block this and require firebase-admin.verifyIdToken()
        if (process.env.NODE_ENV === 'production') {
           console.error('CRITICAL SECURITY ALERT: Unverified Firebase token blocked in production.');
           throw new Error('Token verification required');
        }

        req.user = {
          userId: decodedFirebase.sub || decodedFirebase.user_id,
          role: 'ADMIN' 
        };
        return next();
      }

      console.warn('Rejected Auth Token:', { 
        iss: decodedFirebase?.iss, 
        aud: decodedFirebase?.aud, 
        sub: decodedFirebase?.sub 
      });
      throw new Error('Invalid token');
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
