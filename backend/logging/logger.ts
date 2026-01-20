/**
 * Logger Implementation
 * 
 * Structured logging with execution tracking
 */

import { ILogger, LogEntry, ExecutionLog, LogLevel } from './types';
import { WorkflowExecutionState, NodeExecutionResult } from '../../shared/workflow-spec/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-Memory Logger (for development)
 * 
 * In production, replace with:
 * - Database-backed logger (PostgreSQL, MongoDB)
 * - Distributed tracing (OpenTelemetry, Jaeger)
 * - Log aggregation (ELK, Datadog, etc.)
 */
export class InMemoryLogger implements ILogger {
  private logs: Map<string, LogEntry[]> = new Map();
  private executionLogs: Map<string, ExecutionLog> = new Map();

  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    // Store in execution log if executionId provided
    if (metadata?.executionId) {
      const executionId = metadata.executionId as string;
      if (!this.logs.has(executionId)) {
        this.logs.set(executionId, []);
      }
      this.logs.get(executionId)!.push(entry);
    }

    // Also log to console (in production, send to log aggregation service)
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn :
                     level === 'debug' ? console.debug : console.log;
    
    logMethod(`[${level.toUpperCase()}] ${message}`, metadata || '');
  }

  logExecutionStart(executionId: string, workflowId: string, workflowVersion: number): void {
    this.log('info', `Execution started: ${executionId}`, {
      executionId,
      workflowId,
      workflowVersion,
    });

    // Initialize execution log
    const executionLog: ExecutionLog = {
      executionId,
      workflowId,
      workflowVersion,
      state: {
        executionId,
        workflowId,
        workflowVersion,
        status: 'running',
        nodeResults: [],
        context: {
          executionId,
          workflowId,
          workflowVersion,
          triggerPayload: {},
          variables: {},
          startedAt: new Date().toISOString(),
        },
        startedAt: new Date().toISOString(),
        metadata: {
          nodesExecuted: 0,
          totalDurationMs: 0,
          resumable: false,
        },
      },
      logs: [],
      nodeResults: [],
      startedAt: new Date().toISOString(),
    };

    this.executionLogs.set(executionId, executionLog);
  }

  logExecutionEnd(executionId: string, status: 'completed' | 'failed' | 'cancelled'): void {
    this.log('info', `Execution ended: ${executionId}`, {
      executionId,
      status,
    });

    const executionLog = this.executionLogs.get(executionId);
    if (executionLog) {
      executionLog.state.status = status;
      executionLog.completedAt = new Date().toISOString();
      executionLog.logs = this.logs.get(executionId) || [];
    }
  }

  logNodeExecution(executionId: string, nodeId: string, result: NodeExecutionResult): void {
    const level: LogLevel = result.status === 'error' ? 'error' : 
                           result.status === 'skipped' ? 'warn' : 'info';

    this.log(level, `Node executed: ${nodeId}`, {
      executionId,
      nodeId,
      status: result.status,
      durationMs: result.durationMs,
      attempt: result.attempt,
    });

    const executionLog = this.executionLogs.get(executionId);
    if (executionLog) {
      executionLog.nodeResults.push(result);
      executionLog.state.nodeResults.push(result);
      executionLog.state.metadata.nodesExecuted++;
      executionLog.state.metadata.totalDurationMs += result.durationMs;
    }
  }

  async getExecutionLog(executionId: string): Promise<ExecutionLog | null> {
    const executionLog = this.executionLogs.get(executionId);
    if (!executionLog) {
      return null;
    }

    // Attach logs
    executionLog.logs = this.logs.get(executionId) || [];

    return executionLog;
  }

  async queryExecutionLogs(filters: {
    workflowId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ExecutionLog[]> {
    let results = Array.from(this.executionLogs.values());

    // Apply filters
    if (filters.workflowId) {
      results = results.filter((log) => log.workflowId === filters.workflowId);
    }

    if (filters.status) {
      results = results.filter((log) => log.state.status === filters.status);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      results = results.filter((log) => new Date(log.startedAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      results = results.filter((log) => new Date(log.startedAt) <= endDate);
    }

    // Sort by startedAt descending
    results.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    // Apply limit
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    // Attach logs to each execution
    results.forEach((log) => {
      log.logs = this.logs.get(log.executionId) || [];
    });

    return results;
  }
}

/**
 * Global logger instance
 */
export const logger = new InMemoryLogger();
