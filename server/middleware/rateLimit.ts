import { Request, Response, NextFunction } from 'express';

const requestsMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 60; // 60 requests per minute

  const record = requestsMap.get(ip);

  if (!record || now > record.resetTime) {
    requestsMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Ephemeral rate limit exceeded.' });
  }

  record.count += 1;
  next();
}
