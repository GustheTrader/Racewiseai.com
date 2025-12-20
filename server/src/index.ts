import express from 'express';
import cors from 'cors';
import { getConfig, logger } from './utils/env.js';
import { CronScheduler } from './services/cronScheduler.js';
import scraperRouter from './routes/scraper.js';

const app = express();
const config = getConfig();
const cronScheduler = new CronScheduler();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/scraper', scraperRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    // Start Express server
    const server = app.listen(config.serverPort, () => {
      logger.info(`Server started on port ${config.serverPort}`);
      logger.info(`Health check: http://localhost:${config.serverPort}/health`);
      logger.info(`API docs available at http://localhost:${config.serverPort}/api/scraper`);
    });

    // Start cron jobs
    cronScheduler.startAll();

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down gracefully...');
      cronScheduler.stopAll();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
