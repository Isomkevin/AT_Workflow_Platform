/**
 * API Server
 * 
 * Main Express server for the workflow platform
 */

import express from 'express';
import * as net from 'net';
import { createWorkflowRoutes } from './routes/workflows';
import { WorkflowExecutionEngine } from '../execution-engine/executor';
import { RedisSessionManager } from '../state/session-manager';
import { initializeNodeDefinitions } from '../../shared/node-definitions';
import { ATClient } from '../adapters/africas-talking/client';
import {
  SendSMSExecutor,
  SendUSSDResponseExecutor,
  InitiateCallExecutor,
  PlayIVRExecutor,
  CollectDTMFExecutor,
  RequestPaymentExecutor,
  RefundPaymentExecutor,
} from '../adapters/africas-talking/node-executors';

/**
 * Create and configure Express app
 */
export function createApp(atConfig?: {
  username: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS (configure appropriately for production)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Initialize node definitions
  initializeNodeDefinitions();

  // Initialize execution engine
  const executionEngine = new WorkflowExecutionEngine();

  // Initialize Africa's Talking client and executors (if config provided)
  if (atConfig) {
    const atClient = new ATClient(atConfig);

    // Register AT node executors
    executionEngine.registerExecutor('SEND_SMS', new SendSMSExecutor(atClient));
    executionEngine.registerExecutor('SEND_USSD_RESPONSE', new SendUSSDResponseExecutor(atClient));
    executionEngine.registerExecutor('INITIATE_CALL', new InitiateCallExecutor(atClient));
    executionEngine.registerExecutor('PLAY_IVR', new PlayIVRExecutor(atClient));
    executionEngine.registerExecutor('COLLECT_DTMF', new CollectDTMFExecutor(atClient));
    executionEngine.registerExecutor('REQUEST_PAYMENT', new RequestPaymentExecutor(atClient));
    executionEngine.registerExecutor('REFUND_PAYMENT', new RefundPaymentExecutor(atClient));
  }

  // Initialize session manager
  const sessionManager = new RedisSessionManager(3600); // 1 hour default TTL

  // Routes
  app.use('/api/workflows', createWorkflowRoutes(executionEngine, sessionManager));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`Could not find an available port after ${maxAttempts} attempts starting from ${startPort}`);
}

/**
 * Start server
 */
export async function startServer(port: number = 3001, atConfig?: {
  username: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}): Promise<void> {
  const app = createApp(atConfig);
  
  // Check if the requested port is available, if not try to find an alternative
  const requestedPort = port;
  const availablePort = await isPortAvailable(port);
  
  if (!availablePort) {
    console.warn(`⚠️  Port ${port} is already in use. Searching for an available port...`);
    try {
      const alternativePort = await findAvailablePort(port);
      port = alternativePort;
      console.log(`✅ Using alternative port: ${port}`);
    } catch (error) {
      console.error(`\n❌ Error: Could not find an available port.`);
      console.error(`\nPort ${requestedPort} is in use. To fix this:`);
      console.error(`  1. Stop the process using port ${requestedPort}`);
      console.error(`  2. Use a different port by setting PORT environment variable (e.g., PORT=3002)`);
      console.error(`\nTo find and kill the process on Windows:`);
      console.error(`  netstat -ano | findstr :${requestedPort}`);
      console.error(`  taskkill /PID <PID> /F`);
      console.error(`\nTo find and kill the process on Linux/Mac:`);
      console.error(`  lsof -ti:${requestedPort} | xargs kill -9`);
      process.exit(1);
    }
  }
  
  const server = app.listen(port, () => {
    console.log(`✅ Workflow API server running on port ${port}`);
    if (port !== requestedPort) {
      console.log(`   (Requested port ${requestedPort} was in use)`);
    }
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${port} became unavailable during startup.`);
      console.error(`\nTo fix this, you can:`);
      console.error(`  1. Stop the process using port ${port}`);
      console.error(`  2. Use a different port by setting PORT environment variable`);
      console.error(`\nTo find and kill the process on Windows:`);
      console.error(`  netstat -ano | findstr :${port}`);
      console.error(`  taskkill /PID <PID> /F`);
      console.error(`\nTo find and kill the process on Linux/Mac:`);
      console.error(`  lsof -ti:${port} | xargs kill -9`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
}
