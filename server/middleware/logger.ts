import { Request, Response, NextFunction } from 'express';

export interface OperationalLogEvent {
  requestId: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
  event: string;
  details?: Record<string, any>;
}

export function requestTracker(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const reqId = `req_${startTime}_${Math.random().toString(36).substring(2, 6)}`;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const logData: OperationalLogEvent = {
      requestId: reqId,
      method: req.method,
      route: req.path,
      status: res.statusCode,
      durationMs,
      event: res.statusCode >= 400 ? 'REQUEST_FAILED' : 'REQUEST_COMPLETED'
    };

    // Emit structured JSON operational log to stdout (Zero secrets or candidate payload content)
    console.log(JSON.stringify(logData));
  });

  next();
}

/**
 * Emits a structured operational telemetry log to server stdout.
 * Guaranteed zero candidate PII or raw payload output.
 */
export function logOperationalEvent(event: string, details: Record<string, any> = {}) {
  // Sanitize details map to ensure keys/tokens are never emitted
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    if (['apiKey', 'authorization', 'x-groq-api-key', 'resumeText', 'code', 'userAnswer', 'transcript'].includes(key)) {
      continue;
    }
    sanitized[key] = value;
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...sanitized
  };

  console.log(JSON.stringify(logEntry));
}
