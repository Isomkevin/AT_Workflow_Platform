/**
 * API Server
 * 
 * Main Express server for the workflow platform
 */

import express from 'express';
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
 * Start server
 */
export function startServer(port: number = 3000, atConfig?: {
  username: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}): void {
  const app = createApp(atConfig);
  
  app.listen(port, () => {
    console.log(`Workflow API server running on port ${port}`);
  });
}
