import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('API Keys loaded:', {
  anthropic: process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing',
  openai: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
  google: process.env.GOOGLE_API_KEY ? 'Present' : 'Missing',
});

// Import database to initialize
import './database/db';

// Import routes
import modelsRouter from './routes/models';
import questionsRouter from './routes/questions';
import arenaRouter from './routes/arena';
import analyticsRouter from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/models', modelsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/arena', arenaRouter);
app.use('/api/analytics', analyticsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Legal LLM Arena API Server                        ║
║                                                           ║
║  Server running on: http://localhost:${PORT}              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                           ║
║  Available endpoints:                                     ║
║    GET  /health                                           ║
║    GET  /api/models                                       ║
║    GET  /api/questions                                    ║
║    POST /api/arena/match                                  ║
║    POST /api/arena/submit                                 ║
║    GET  /api/analytics/overview                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
