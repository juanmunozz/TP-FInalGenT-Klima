import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no configurado');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    (req as any).admin = payload;
    next();
  } catch { res.status(401).json({ error: 'Acceso no autorizado.' }); }
}
