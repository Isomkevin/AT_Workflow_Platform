/**
 * Execution Engine
 * 
 * Executes compiled workflows in a scalable, resumable manner.
 * 
 * Design principles:
 * - Event-driven: Each step is independent
 * - Stateless per step: Can resume from any point
 * - Idempotent: Safe to retry
 * - Horizontally scalable: Multiple workers can execute steps
 */

import { ExecutionGraph, ExecutionNode } from '../compiler/types';
import {
  ExecutionState,
  ExecutionResult,
  ExecutionOptions,
  INodeExecutor,
  ExecutionStep,
} from './types';
import {
  ExecutionContext,
  NodeExecutionResult,
  NodeError,
  SessionState,
} from '../../shared/workflow-spec/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Workflow Execution Engine
 */
export class WorkflowExecutionEngine {
  private nodeExecutors: Map<string, INodeExecutor> = new Map();

  /**
   * Register a node executor for a node type
   */
  registerExecutor(nodeType: string, executor: INodeExecutor): void {
    this.nodeExecutors.set(nodeType, executor);
  }

  /**
   * Execute a workflow
   */
  async execute(
    graph: ExecutionGraph,
    triggerPayload: Record<string, unknown>,
    session?: SessionState,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const executionId = uuidv4();
    const startedAt = new Date().toISOString();

    // Build execution context
    const context: ExecutionContext = {
      executionId,
      workflowId: graph.workflowId,
      workflowVersion: graph.workflowVersion,
      triggerPayload,
      session,
      variables: { ...triggerPayload },
      startedAt,
    };

    // Initialize execution state
    const state: ExecutionState = {
      executionId,
      workflowId: graph.workflowId,
      workflowVersion: graph.workflowVersion,
      graph,
      context,
      status: 'running',
      nodeResults: new Map(),
      startedAt,
      metadata: {
        nodesExecuted: 0,
        totalDurationMs: 0,
        resumable: options.resumable ?? false,
      },
    };

    try {
      // Execute workflow
      const result = await this.executeWorkflow(state, options);
      return result;
    } catch (error) {
      // Handle unexpected errors
      const nodeError: NodeError = {
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown execution error',
        type: 'permanent',
        stack: error instanceof Error ? error.stack : undefined,
      };

      return {
        executionId,
        status: 'failed',
        error: nodeError,
        nodeResults: [],
        durationMs: Date.now() - new Date(startedAt).getTime(),
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Execute a single step (for resumable execution)
   */
  async executeStep(
    state: ExecutionState,
    step: ExecutionStep,
    options: ExecutionOptions = {}
  ): Promise<ExecutionState> {
    const node = state.graph.nodes.get(step.nodeId);
    if (!node) {
      throw new Error(`Node ${step.nodeId} not found in graph`);
    }

    if (node.disabled) {
      // Skip disabled nodes
      const result: NodeExecutionResult = {
        nodeId: step.nodeId,
        status: 'skipped',
        durationMs: 0,
        executedAt: new Date().toISOString(),
        attempt: step.attempt,
      };

      this.recordNodeResult(state, result);
      return state;
    }

    // Get executor for node type
    const executor = this.nodeExecutors.get(node.type);
    if (!executor) {
      throw new Error(`No executor registered for node type: ${node.type}`);
    }

    // Execute node
    const startTime = Date.now();
    let result: NodeExecutionResult;

    try {
      result = await executor.execute(node, state.context, step.input);
    } catch (error) {
      // Handle execution errors
      result = {
        nodeId: step.nodeId,
        status: 'error',
        error: {
          code: 'NODE_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'permanent',
          stack: error instanceof Error ? error.stack : undefined,
        },
        durationMs: Date.now() - startTime,
        executedAt: new Date().toISOString(),
        attempt: step.attempt,
      };
    }

    // Record result
    this.recordNodeResult(state, result);

    // Update context with output
    if (result.status === 'success' && result.output) {
      state.context.variables = {
        ...state.context.variables,
        ...result.output,
        [`node_${step.nodeId}`]: result.output,
      };
    }

    // Update state
    state.currentNodeId = step.nodeId;
    state.metadata.nodesExecuted++;
    state.metadata.totalDurationMs += result.durationMs;

    return state;
  }

  /**
   * Execute entire workflow
   */
  private async executeWorkflow(
    state: ExecutionState,
    options: ExecutionOptions
  ): Promise<ExecutionResult> {
    const maxExecutionTime = options.maxExecutionTimeMs || 300000; // 5 minutes default
    const startTime = Date.now();

    // Execute nodes in topological order
    for (const nodeId of state.graph.executionOrder) {
      // Check timeout
      if (Date.now() - startTime > maxExecutionTime) {
        return {
          executionId: state.executionId,
          status: 'failed',
          error: {
            code: 'EXECUTION_TIMEOUT',
            message: 'Workflow execution exceeded maximum time',
            type: 'permanent',
          },
          nodeResults: this.getAllNodeResults(state),
          durationMs: Date.now() - startTime,
          startedAt: state.startedAt,
          completedAt: new Date().toISOString(),
        };
      }

      const node = state.graph.nodes.get(nodeId);
      if (!node) {
        continue;
      }

      // Skip trigger (already processed)
      if (nodeId === state.graph.trigger.id) {
        continue;
      }

      // Get input from previous nodes
      const input = this.getNodeInput(state, node);

      // Execute node
      const step: ExecutionStep = {
        stepId: uuidv4(),
        nodeId,
        input,
        attempt: 0,
        timestamp: new Date().toISOString(),
      };

      state = await this.executeStep(state, step, options);

      // Handle retries if needed
      if (state.nodeResults.get(nodeId)?.[0]?.status === 'error' && options.enableRetries) {
        state = await this.handleRetry(state, node, step, options);
      }

      // Check if execution should stop (e.g., session ended)
      if (node.metadata.endsSession) {
        break;
      }
    }

    // Determine final status
    const allResults = this.getAllNodeResults(state);
    const hasErrors = allResults.some((r) => r.status === 'error');
    const finalStatus: 'completed' | 'failed' = hasErrors ? 'failed' : 'completed';

    // Get final output (from last executed node)
    const lastResult = allResults[allResults.length - 1];
    const output = lastResult?.status === 'success' ? lastResult.output : undefined;

    return {
      executionId: state.executionId,
      status: finalStatus,
      output,
      error: hasErrors ? allResults.find((r) => r.status === 'error')?.error : undefined,
      nodeResults: allResults,
      durationMs: Date.now() - startTime,
      startedAt: state.startedAt,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Handle retry logic for a failed node
   */
  private async handleRetry(
    state: ExecutionState,
    node: ExecutionNode,
    step: ExecutionStep,
    options: ExecutionOptions
  ): Promise<ExecutionState> {
    if (!node.retry) {
      return state;
    }

    const { maxAttempts, initialDelayMs, backoffMultiplier = 2, retryableErrors } = node.retry;
    let delay = initialDelayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const lastResult = state.nodeResults.get(node.id)?.[0];
      if (!lastResult || lastResult.status !== 'error') {
        break;
      }

      // Check if error is retryable
      if (retryableErrors && lastResult.error) {
        if (!retryableErrors.includes(lastResult.error.code)) {
          break; // Not retryable
        }
      }

      // Wait before retry
      await this.sleep(delay);

      // Retry execution
      const retryStep: ExecutionStep = {
        ...step,
        stepId: uuidv4(),
        attempt,
        timestamp: new Date().toISOString(),
      };

      state = await this.executeStep(state, retryStep, options);

      // Check if retry succeeded
      const retryResult = state.nodeResults.get(node.id)?.[0];
      if (retryResult?.status === 'success') {
        break; // Success, stop retrying
      }

      // Exponential backoff
      delay = Math.min(delay * backoffMultiplier, node.retry.maxDelayMs || Infinity);
    }

    return state;
  }

  /**
   * Get input data for a node from previous nodes
   */
  private getNodeInput(state: ExecutionState, node: ExecutionNode): Record<string, unknown> {
    const input: Record<string, unknown> = {};

    // Collect output from all incoming edges
    for (const edge of node.incomingEdges) {
      const sourceResults = state.nodeResults.get(edge.source);
      if (sourceResults && sourceResults.length > 0) {
        const lastResult = sourceResults[sourceResults.length - 1];
        if (lastResult.status === 'success' && lastResult.output) {
          // Merge output based on edge handle
          if (edge.sourceHandle) {
            input[edge.sourceHandle] = lastResult.output[edge.sourceHandle];
          } else {
            Object.assign(input, lastResult.output);
          }
        }
      }
    }

    // Include context variables
    Object.assign(input, state.context.variables);

    return input;
  }

  /**
   * Record node execution result
   */
  private recordNodeResult(state: ExecutionState, result: NodeExecutionResult): void {
    if (!state.nodeResults.has(result.nodeId)) {
      state.nodeResults.set(result.nodeId, []);
    }
    state.nodeResults.get(result.nodeId)!.unshift(result); // Most recent first
  }

  /**
   * Get all node results in execution order
   */
  private getAllNodeResults(state: ExecutionState): NodeExecutionResult[] {
    const results: NodeExecutionResult[] = [];
    for (const nodeId of state.graph.executionOrder) {
      const nodeResults = state.nodeResults.get(nodeId);
      if (nodeResults && nodeResults.length > 0) {
        results.push(nodeResults[0]); // Most recent result
      }
    }
    return results;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
