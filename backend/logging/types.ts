/**
 * Logging Types
 * 
 * Structured logging for workflow execution observability
 */

import { NodeExecutionResult, WorkflowExecutionState } from '../../shared/workflow-spec/types';

/**
 * Log Level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log Entry
 */
export interface LogEntry {
  /** Log ID */
  id: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Log level */
  level: LogLevel;
  
  /** Message */
  message: string;
  
  /** Execution ID (if applicable) */
  executionId?: string;
  
  /** Workflow ID (if applicable) */
  workflowId?: string;
  
  /** Node ID (if applicable) */
  nodeId?: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  
  /** Error details (if error log) */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Execution Log
 * Complete log for a workflow execution
 */
export interface ExecutionLog {
  /** Execution ID */
  executionId: string;
  
  /** Workflow ID and version */
  workflowId: string;
  workflowVersion: number;
  
  /** Execution state */
  state: WorkflowExecutionState;
  
  /** All log entries */
  logs: LogEntry[];
  
  /** Node execution results */
  nodeResults: NodeExecutionResult[];
  
  /** Started timestamp */
  startedAt: string;
  
  /** Completed timestamp */
  completedAt?: string;
}

/**
 * Logger Interface
 */
export interface ILogger {
  /**
   * Log a message
   */
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log execution start
   */
  logExecutionStart(executionId: string, workflowId: string, workflowVersion: number): void;

  /**
   * Log execution end
   */
  logExecutionEnd(executionId: string, status: 'completed' | 'failed' | 'cancelled'): void;

  /**
   * Log node execution
   */
  logNodeExecution(executionId: string, nodeId: string, result: NodeExecutionResult): void;

  /**
   * Get execution log
   */
  getExecutionLog(executionId: string): Promise<ExecutionLog | null>;

  /**
   * Query execution logs
   */
  queryExecutionLogs(filters: {
    workflowId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ExecutionLog[]>;
}
