/**
 * Workflow Specification - Canonical Type Definitions
 * 
 * This is the single source of truth for workflow structure.
 * All frontend and backend code must conform to these types.
 * 
 * Design principles:
 * - Deterministic: Same workflow spec always produces same execution
 * - Versioned: Support workflow evolution and migration
 * - Observable: Every step is traceable
 * - Resumable: Execution can be paused and resumed
 */

import { z } from 'zod';

/**
 * Workflow Metadata
 * Tracks ownership, versioning, and audit information
 */
export interface WorkflowMetadata {
  /** Unique workflow identifier */
  workflowId: string;
  
  /** Semantic version of the workflow */
  version: number;
  
  /** Human-readable name */
  name: string;
  
  /** Optional description */
  description?: string;
  
  /** User/team who created this workflow */
  createdBy: string;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last publish */
  publishedAt?: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Environment (dev, staging, prod) */
  environment?: 'dev' | 'staging' | 'prod';
}

/**
 * Node Position (for React Flow compatibility)
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Node Base Interface
 * All nodes in the workflow extend this
 */
export interface BaseNode {
  /** Unique node ID within the workflow */
  id: string;
  
  /** Node type (must match a registered node definition) */
  type: string;
  
  /** Display label */
  label: string;
  
  /** Position in canvas (for UI) */
  position?: NodePosition;
  
  /** Node-specific configuration (validated against node schema) */
  config: Record<string, unknown>;
  
  /** Retry configuration */
  retry?: RetryConfig;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Whether this node is disabled */
  disabled?: boolean;
}

/**
 * Retry Configuration
 * Defines how a node should retry on failure
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  
  /** Backoff multiplier (exponential) */
  backoffMultiplier?: number;
  
  /** Maximum delay cap in milliseconds */
  maxDelayMs?: number;
  
  /** Which error types should trigger retry */
  retryableErrors?: string[];
}

/**
 * Edge/Connection between nodes
 */
export interface WorkflowEdge {
  /** Unique edge ID */
  id: string;
  
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Source handle (for nodes with multiple outputs) */
  sourceHandle?: string;
  
  /** Target handle (for nodes with multiple inputs) */
  targetHandle?: string;
  
  /** Condition for conditional edges (e.g., "success", "error", "condition_met") */
  condition?: string;
  
  /** Edge label (for UI) */
  label?: string;
}

/**
 * Trigger Node
 * Special node type that initiates workflow execution
 */
export interface TriggerNode extends BaseNode {
  type: 
    | 'SMS_RECEIVED'
    | 'USSD_SESSION_START'
    | 'INCOMING_CALL'
    | 'PAYMENT_CALLBACK'
    | 'SCHEDULED'
    | 'HTTP_WEBHOOK';
}

/**
 * Complete Workflow Specification
 * This is the canonical format stored in DB and executed by the engine
 */
export interface WorkflowSpec {
  /** Workflow metadata */
  metadata: WorkflowMetadata;
  
  /** Trigger node (workflow entry point) */
  trigger: TriggerNode;
  
  /** All nodes in the workflow (including trigger) */
  nodes: BaseNode[];
  
  /** All edges/connections between nodes */
  edges: WorkflowEdge[];
  
  /** Global workflow settings */
  settings?: WorkflowSettings;
  
  /** Error handling configuration */
  errorHandling?: ErrorHandlingConfig;
}

/**
 * Workflow Settings
 * Global configuration that applies to entire workflow
 */
export interface WorkflowSettings {
  /** Maximum execution time in milliseconds */
  maxExecutionTimeMs?: number;
  
  /** Timezone for scheduled triggers */
  timezone?: string;
  
  /** Rate limiting configuration */
  rateLimit?: RateLimitConfig;
  
  /** Whether to enable execution replay */
  enableReplay?: boolean;
  
  /** Maximum number of concurrent executions */
  maxConcurrentExecutions?: number;
}

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  
  /** Time window in milliseconds */
  windowMs: number;
  
  /** Strategy: 'fixed' or 'sliding' */
  strategy: 'fixed' | 'sliding';
}

/**
 * Error Handling Configuration
 */
export interface ErrorHandlingConfig {
  /** Default retry config for nodes without explicit retry */
  defaultRetry?: RetryConfig;
  
  /** Whether to continue execution on non-critical errors */
  continueOnError?: boolean;
  
  /** Error notification webhook */
  errorWebhook?: string;
  
  /** Maximum number of errors before workflow is marked failed */
  maxErrors?: number;
}

/**
 * Execution Context
 * Runtime data passed through workflow execution
 */
export interface ExecutionContext {
  /** Unique execution ID */
  executionId: string;
  
  /** Workflow ID and version */
  workflowId: string;
  workflowVersion: number;
  
  /** Trigger payload (normalized) */
  triggerPayload: Record<string, unknown>;
  
  /** Session state (for USSD, Voice sessions) */
  session?: SessionState;
  
  /** Variables accessible via {{variable.name}} syntax */
  variables: Record<string, unknown>;
  
  /** Execution metadata */
  startedAt: string;
  startedBy?: string;
}

/**
 * Session State
 * Maintains state across multiple interactions (e.g., USSD menu navigation)
 */
export interface SessionState {
  /** Session ID */
  sessionId: string;
  
  /** Session type */
  type: 'ussd' | 'voice' | 'sms' | 'payment';
  
  /** MSISDN (phone number) */
  msisdn: string;
  
  /** Session data (key-value store) */
  data: Record<string, unknown>;
  
  /** Session creation timestamp */
  createdAt: string;
  
  /** Last activity timestamp */
  lastActivityAt: string;
  
  /** Session expiry timestamp */
  expiresAt?: string;
  
  /** Whether session is active */
  isActive: boolean;
}

/**
 * Node Execution Result
 * Result of executing a single node
 */
export interface NodeExecutionResult {
  /** Node ID */
  nodeId: string;
  
  /** Execution status */
  status: 'success' | 'error' | 'skipped' | 'timeout';
  
  /** Output data (if successful) */
  output?: Record<string, unknown>;
  
  /** Error information (if failed) */
  error?: NodeError;
  
  /** Execution duration in milliseconds */
  durationMs: number;
  
  /** Timestamp of execution */
  executedAt: string;
  
  /** Retry attempt number (0 = first attempt) */
  attempt: number;
}

/**
 * Node Error
 * Structured error information
 */
export interface NodeError {
  /** Error code (machine-readable) */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Error type (for retry logic) */
  type: 'transient' | 'permanent' | 'rate_limit' | 'validation';
  
  /** Original error details */
  details?: Record<string, unknown>;
  
  /** Stack trace (if available) */
  stack?: string;
}

/**
 * Workflow Execution State
 * Tracks the state of a workflow execution
 */
export interface WorkflowExecutionState {
  /** Execution ID */
  executionId: string;
  
  /** Workflow ID and version */
  workflowId: string;
  workflowVersion: number;
  
  /** Overall execution status */
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  
  /** Node execution results (ordered by execution) */
  nodeResults: NodeExecutionResult[];
  
  /** Current node being executed */
  currentNodeId?: string;
  
  /** Execution context */
  context: ExecutionContext;
  
  /** Started timestamp */
  startedAt: string;
  
  /** Completed timestamp (if finished) */
  completedAt?: string;
  
  /** Error (if failed) */
  error?: NodeError;
}

/**
 * Zod Schema for Workflow Spec Validation
 * Use this for runtime validation
 */
export const WorkflowSpecSchema = z.object({
  metadata: z.object({
    workflowId: z.string().uuid(),
    version: z.number().int().positive(),
    name: z.string().min(1),
    description: z.string().optional(),
    createdBy: z.string().min(1),
    createdAt: z.string().datetime(),
    publishedAt: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    environment: z.enum(['dev', 'staging', 'prod']).optional(),
  }),
  trigger: z.object({
    id: z.string(),
    type: z.enum([
      'SMS_RECEIVED',
      'USSD_SESSION_START',
      'INCOMING_CALL',
      'PAYMENT_CALLBACK',
      'SCHEDULED',
      'HTTP_WEBHOOK',
    ]),
    label: z.string(),
    config: z.record(z.unknown()),
    retry: z.object({
      maxAttempts: z.number().int().positive(),
      initialDelayMs: z.number().int().nonnegative(),
      backoffMultiplier: z.number().positive().optional(),
      maxDelayMs: z.number().int().positive().optional(),
      retryableErrors: z.array(z.string()).optional(),
    }).optional(),
    timeout: z.number().int().positive().optional(),
    disabled: z.boolean().optional(),
  }),
  nodes: z.array(z.any()), // Validated separately against node definitions
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    condition: z.string().optional(),
    label: z.string().optional(),
  })),
  settings: z.object({
    maxExecutionTimeMs: z.number().int().positive().optional(),
    timezone: z.string().optional(),
    rateLimit: z.object({
      maxRequests: z.number().int().positive(),
      windowMs: z.number().int().positive(),
      strategy: z.enum(['fixed', 'sliding']),
    }).optional(),
    enableReplay: z.boolean().optional(),
    maxConcurrentExecutions: z.number().int().positive().optional(),
  }).optional(),
  errorHandling: z.object({
    defaultRetry: z.any().optional(),
    continueOnError: z.boolean().optional(),
    errorWebhook: z.string().url().optional(),
    maxErrors: z.number().int().positive().optional(),
  }).optional(),
});

/**
 * Type guard to check if a node is a trigger
 */
export function isTriggerNode(node: BaseNode): node is TriggerNode {
  const triggerTypes = [
    'SMS_RECEIVED',
    'USSD_SESSION_START',
    'INCOMING_CALL',
    'PAYMENT_CALLBACK',
    'SCHEDULED',
    'HTTP_WEBHOOK',
  ];
  return triggerTypes.includes(node.type);
}
