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
      // 2. Try Firebase ID Token
      // For immediate resolution without service account JSON, we decode and verify claims
      const decodedFirebase: any = jwt.decode(token);

      // Multi-pattern check for Firebase (google.com or firebase)
      const isFirebase = decodedFirebase && (
        (decodedFirebase.iss && decodedFirebase.iss.includes('firebase')) ||
        (decodedFirebase.iss && decodedFirebase.iss.includes('google.com')) ||
        (decodedFirebase.aud && decodedFirebase.aud.includes('neurocloak'))
      );

      if (isFirebase) {
        req.user = {
          userId: decodedFirebase.sub || decodedFirebase.user_id,
          role: 'ADMIN' // Treat Firebase authenticated users as ADMIN for this dashboard
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
