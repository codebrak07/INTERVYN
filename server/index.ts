import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { securityHeaders, zeroLogging } from './middleware/security';
import { rateLimiter } from './middleware/rateLimit';
import aiRoutes from './routes/ai';
import codeRoutes from './routes/code';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Resolving directory paths for ES modules / TypeScript Node runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

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

// Serve compiled static assets from dist/
app.use(express.static(distPath));

// Fallback to index.html for Single Page Application (SPA) routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[EPHEMERAL API GATEWAY] Running stateless proxy server on http://localhost:${PORT}`);
});
