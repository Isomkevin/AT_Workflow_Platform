/**
 * Execution Engine Types
 * 
 * The execution engine runs compiled workflows in a scalable, resumable manner.
 */

import { ExecutionGraph, ExecutionNode } from '../compiler/types';
import { ExecutionContext, SessionState, NodeExecutionResult, NodeError } from '../../shared/workflow-spec/types';

/**
 * Execution State
 * Tracks the current state of a workflow execution
 */
export interface ExecutionState {
  /** Execution ID */
  executionId: string;
  
  /** Workflow ID and version */
  workflowId: string;
  workflowVersion: number;
  
  /** Execution graph */
  graph: ExecutionGraph;
  
  /** Execution context */
  context: ExecutionContext;
  
  /** Current node being executed */
  currentNodeId?: string;
  
  /** Execution status */
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  
  /** Node execution results */
  nodeResults: Map<string, NodeExecutionResult[]>;
  
  /** Started timestamp */
  startedAt: string;
  
  /** Completed timestamp */
  completedAt?: string;
  
  /** Error (if failed) */
  error?: NodeError;
  
  /** Execution metadata */
  metadata: {
    /** Number of nodes executed */
    nodesExecuted: number;
    
    /** Total execution time so far */
    totalDurationMs: number;
    
    /** Whether execution is resumable */
    resumable: boolean;
  };
}

/**
 * Node Executor
 * Executes a single node and returns the result
 */
export interface INodeExecutor {
  /**
   * Execute a node
   * @param node Node to execute
   * @param context Execution context
   * @param input Input data from previous nodes
   * @returns Execution result
   */
  execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult>;
}

/**
 * Execution Step
 * Represents a single step in workflow execution
 */
export interface ExecutionStep {
  /** Step ID */
  stepId: string;
  
  /** Node ID to execute */
  nodeId: string;
  
  /** Input data */
  input: Record<string, unknown>;
  
  /** Attempt number */
  attempt: number;
  
  /** Timestamp */
  timestamp: string;
}

/**
 * Execution Result
 * Final result of workflow execution
 */
export interface ExecutionResult {
  /** Execution ID */
  executionId: string;
  
  /** Execution status */
  status: 'completed' | 'failed' | 'cancelled';
  
  /** Final output (from last node) */
  output?: Record<string, unknown>;
  
  /** Error (if failed) */
  error?: NodeError;
  
  /** All node results */
  nodeResults: NodeExecutionResult[];
  
  /** Execution duration */
  durationMs: number;
  
  /** Started timestamp */
  startedAt: string;
  
  /** Completed timestamp */
  completedAt: string;
}

/**
 * Execution Options
 */
export interface ExecutionOptions {
  /** Maximum execution time in milliseconds */
  maxExecutionTimeMs?: number;
  
  /** Whether to enable retries */
  enableRetries?: boolean;
  
  /** Whether execution can be paused/resumed */
  resumable?: boolean;
  
  /** Execution timeout */
  timeout?: number;
}
