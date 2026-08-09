import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, zeroLogging } from './middleware/security';
import { rateLimiter } from './middleware/rateLimit';
import aiRoutes from './routes/ai';
import codeRoutes from './routes/code';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Stateless Security & Ephemeral Middlewares
app.use(securityHeaders);
app.use(zeroLogging);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/code', codeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ephemeralGateway: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[EPHEMERAL API GATEWAY] Running stateless proxy server on http://localhost:${PORT}`);
});
