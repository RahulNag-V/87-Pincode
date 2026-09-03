import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserRecord } from './db.js';
import { UserProfile } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || '87pincode-luxury-secret-key-production';

export interface AuthRequest extends Request {
  user?: UserProfile;
}

export function generateToken(user: UserProfile): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Middleware that extracts and validates the JWT token if present.
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies['87pincode_token']) {
    token = req.cookies['87pincode_token'];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findProfileById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        is_verified: user.is_verified,
        created_at: user.created_at
      };
    }
  } catch (err) {
    // Token invalid or expired, continue as guest
  }
  next();
}

/**
 * Middleware that requires a logged-in user.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Sign in to continue with your order.'
    });
  }
  next();
}

/**
 * Middleware that requires the user to have the ADMIN role in the database.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required for administrative access.'
    });
  }

  // Look up fresh from database to prevent stale claims
  const profile = db.findProfileById(req.user.id);
  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Administrative privileges required.'
    });
  }

  next();
}
