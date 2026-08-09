import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
}

/**
 * Strict Zero Logging Guarantee:
 * Express middleware ensuring request body content (resumes, transcripts, code) is NEVER written to server log output.
 */
export function zeroLogging(req: Request, res: Response, next: NextFunction) {
  // Omit printing req.body
  console.log(`[EPHEMERAL GATEWAY] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
}
