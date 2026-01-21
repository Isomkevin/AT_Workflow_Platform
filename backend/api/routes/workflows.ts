/**
 * Workflow API Routes
 * 
 * REST API for workflow management and execution
 */

import { Router } from 'express';
import { WorkflowSpec } from '../../shared/workflow-spec/types';
import { compileWorkflow } from '../../compiler';
import { WorkflowExecutionEngine } from '../../execution-engine/executor';
import { logger } from '../../logging/logger';
import { ISessionManager } from '../../state/session-manager';

/**
 * Create workflow routes
 */
export function createWorkflowRoutes(
  executionEngine: WorkflowExecutionEngine,
  sessionManager: ISessionManager
): Router {
  const router = Router();

  /**
   * POST /api/workflows/validate
   * Validate a workflow specification
   */
  router.post('/validate', async (req, res) => {
    try {
      const spec = req.body as WorkflowSpec;
      const { validateWorkflowSpec } = await import('../../shared/workflow-spec/validator');
      const result = validateWorkflowSpec(spec);

      res.json({
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
      });
    } catch (error) {
      logger.log('error', 'Workflow validation error', { error });
      res.status(500).json({
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/workflows/compile
   * Compile a workflow specification
   */
  router.post('/compile', async (req, res) => {
    try {
      const spec = req.body as WorkflowSpec;
      const result = compileWorkflow(spec);

      if (!result.success) {
        res.status(400).json({
          success: false,
          errors: result.errors,
          warnings: result.warnings,
        });
        return;
      }

      res.json({
        success: true,
        graph: result.graph,
        warnings: result.warnings,
      });
    } catch (error) {
      logger.log('error', 'Workflow compilation error', { error });
      res.status(500).json({
        error: 'Compilation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/workflows/execute
   * Execute a workflow
   */
  router.post('/execute', async (req, res) => {
    try {
      const { workflow, triggerPayload, sessionId, options } = req.body;

      // Compile workflow
      const compileResult = compileWorkflow(workflow);
      if (!compileResult.success || !compileResult.graph) {
        res.status(400).json({
          error: 'Compilation failed',
          errors: compileResult.errors,
        });
        return;
      }

      // Get or create session
      let session = null;
      if (sessionId) {
        session = await sessionManager.getSession(sessionId);
      } else if (compileResult.graph.metadata.requiresSession) {
        // Create new session if required
        const { SessionState } = await import('../../shared/workflow-spec/types');
        const { v4: uuidv4 } = await import('uuid');
        
        const msisdn = triggerPayload?.msisdn || triggerPayload?.phoneNumber || 'unknown';
        const sessionType = workflow.trigger.type === 'USSD_SESSION_START' ? 'ussd' :
                           workflow.trigger.type === 'INCOMING_CALL' ? 'voice' :
                           workflow.trigger.type === 'SMS_RECEIVED' ? 'sms' : 'payment';

        session = await sessionManager.createSession({
          sessionId: uuidv4(),
          type: sessionType,
          msisdn: String(msisdn),
          data: {},
          isActive: true,
        });
      }

      // Log execution start
      logger.logExecutionStart(
        `exec_${Date.now()}`,
        workflow.metadata.workflowId,
        workflow.metadata.version
      );

      // Execute workflow
      const executionResult = await executionEngine.execute(
        compileResult.graph,
        triggerPayload || {},
        session || undefined,
        options || {}
      );

      // Log execution end
      logger.logExecutionEnd(
        executionResult.executionId,
        executionResult.status
      );

      res.json({
        executionId: executionResult.executionId,
        status: executionResult.status,
        output: executionResult.output,
        error: executionResult.error,
        nodeResults: executionResult.nodeResults,
        durationMs: executionResult.durationMs,
        sessionId: session?.sessionId,
      });
    } catch (error) {
      logger.log('error', 'Workflow execution error', { error });
      res.status(500).json({
        error: 'Execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/workflows/executions/:executionId
   * Get execution log
   */
  router.get('/executions/:executionId', async (req, res) => {
    try {
      const { executionId } = req.params;
      const executionLog = await logger.getExecutionLog(executionId);

      if (!executionLog) {
        res.status(404).json({ error: 'Execution not found' });
        return;
      }

      res.json(executionLog);
    } catch (error) {
      logger.log('error', 'Get execution log error', { error });
      res.status(500).json({
        error: 'Failed to get execution log',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/workflows/executions
   * Query execution logs
   */
  router.get('/executions', async (req, res) => {
    try {
      const { workflowId, status, startDate, endDate, limit } = req.query;
      
      const logs = await logger.queryExecutionLogs({
        workflowId: workflowId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({ executions: logs });
    } catch (error) {
      logger.log('error', 'Query execution logs error', { error });
      res.status(500).json({
        error: 'Failed to query execution logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
