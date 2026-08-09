import { Request, Response, NextFunction } from 'express';

const requestsMap = new Map<string, { count: number; resetTime: number }>();
const dailySessionsMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute

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

/**
 * Best-effort per-instance Daily Session Limiter (3 free blueprint/session generations per 24 hours per IP).
 * Note: Instance-local in-memory state. For horizontally auto-scaled multi-tenant deployments, upgrade to a shared Redis/KV store.
 * Bypassed ONLY if request contains a valid custom API key header/body.
 */
export function sessionDailyLimiter(req: Request, res: Response, next: NextFunction) {
  const customKey = req.body?.apiKey || (req.headers['x-groq-api-key'] as string);

  // If candidate provides custom API key, bypass server-managed rate limit
  if (customKey && customKey.trim().length > 0) {
    return next();
  }

  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hour window
  const maxDailySessions = 3;

  const record = dailySessionsMap.get(ip);

  if (!record || now > record.resetTime) {
    dailySessionsMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxDailySessions) {
    return res.status(429).json({
      error: 'AI_RATE_LIMITED: Daily free server-managed session limit reached (3/3 sessions per day). Provide your custom Groq API key to continue.',
      isRateLimited: true,
      limit: maxDailySessions
    });
  }

  record.count += 1;
  next();
}
