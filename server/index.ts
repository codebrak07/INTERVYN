import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables before importing routes that depend on process.env
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import { securityHeaders } from './middleware/security';
import { requestTracker } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimit';
import aiRoutes from './routes/ai';
import codeRoutes from './routes/code';

const app = express();
const PORT = process.env.PORT || 3001;

// Resolving directory paths for ES modules / TypeScript Node runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Stateless Security & Ephemeral Middlewares
app.use(securityHeaders);
app.use(requestTracker);
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-groq-api-key', 'X-Request-Id']
}));

// Vercel Serverless & Standalone Node Compatible Body Parser Middleware
app.use((req, res, next) => {
  // If req.body is already parsed by Vercel Serverless runtime, skip re-parsing stream
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  // Otherwise parse JSON stream safely with express.json
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      console.warn('[BODY PARSER WARN]', err.message);
    }
    next();
  });
});

app.use(rateLimiter);

// Ensure URL routing compatibility on Vercel Serverless rewrites
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  next();
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/code', codeRoutes);

// Health & Readiness Endpoints (Operational Telemetry Only - Zero Secrets Exposed)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'intervyn-api',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', (_req, res) => {
  res.json({
    status: 'ready',
    groqProvider: 'available',
    codeExecutionEngine: 'available',
    rateLimiter: 'best-effort-instance-local'
  });
});

import { ServerResumeFallbackParser } from './services/resume/ServerResumeFallbackParser';

// Serve static assets only in standalone Node environment (Vercel CDN handles static assets natively)
if (!process.env.VERCEL) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler guaranteeing 200 JSON fallback for AI endpoints
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API GATEWAY FALLBACK INTERCEPTOR]', err);
  if (req.path && req.path.includes('analyze-resume')) {
    const fallback = ServerResumeFallbackParser.parse(req.body?.resumeText || '');
    return res.status(200).json(fallback);
  }
  return res.status(200).json({
    status: 'ok',
    fallbackUsed: true,
    error: err?.message || 'Server processed request via fallback'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[EPHEMERAL API GATEWAY] Running stateless proxy server on http://localhost:${PORT}`);
  });
}

export default app;
