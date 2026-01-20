/**
 * Workflow Compiler Types
 * 
 * The compiler transforms a WorkflowSpec into an ExecutionGraph
 * that can be efficiently executed by the engine.
 */

import { WorkflowSpec, BaseNode, WorkflowEdge } from '../../shared/workflow-spec/types';
import { NodeDefinition } from '../../shared/node-definitions/types';

/**
 * Execution Graph Node
 * Enhanced node with execution metadata
 */
export interface ExecutionNode {
  /** Node ID */
  id: string;
  
  /** Node type */
  type: string;
  
  /** Node definition reference */
  definition: NodeDefinition;
  
  /** Node configuration */
  config: Record<string, unknown>;
  
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    initialDelayMs: number;
    backoffMultiplier?: number;
    maxDelayMs?: number;
    retryableErrors?: string[];
  };
  
  /** Timeout in milliseconds */
  timeout: number;
  
  /** Whether node is disabled */
  disabled: boolean;
  
  /** Incoming edges (ordered) */
  incomingEdges: ExecutionEdge[];
  
  /** Outgoing edges (ordered) */
  outgoingEdges: ExecutionEdge[];
  
  /** Execution metadata */
  metadata: {
    /** Whether this node requires session */
    requiresSession: boolean;
    
    /** Whether this node ends session */
    endsSession: boolean;
    
    /** Execution order (for topological sort) */
    executionOrder: number;
  };
}

/**
 * Execution Edge
 * Enhanced edge with execution metadata
 */
export interface ExecutionEdge {
  /** Edge ID */
  id: string;
  
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Source handle */
  sourceHandle?: string;
  
  /** Target handle */
  targetHandle?: string;
  
  /** Condition for conditional edges */
  condition?: string;
  
  /** Edge label */
  label?: string;
  
  /** Execution metadata */
  metadata: {
    /** Whether this is a conditional edge */
    isConditional: boolean;
    
    /** Priority (for multiple edges from same source) */
    priority: number;
  };
}

/**
 * Execution Graph
 * Compiled workflow ready for execution
 */
export interface ExecutionGraph {
  /** Workflow ID and version */
  workflowId: string;
  workflowVersion: number;
  
  /** Trigger node */
  trigger: ExecutionNode;
  
  /** All nodes indexed by ID */
  nodes: Map<string, ExecutionNode>;
  
  /** Execution order (topologically sorted) */
  executionOrder: string[];
  
  /** Graph metadata */
  metadata: {
    /** Whether workflow requires session */
    requiresSession: boolean;
    
    /** Whether workflow has session end */
    hasSessionEnd: boolean;
    
    /** Maximum execution depth */
    maxDepth: number;
    
    /** Whether graph has cycles (should be false after validation) */
    hasCycles: boolean;
  };
}

/**
 * Compilation Result
 */
export interface CompilationResult {
  /** Whether compilation succeeded */
  success: boolean;
  
  /** Compiled execution graph (if successful) */
  graph?: ExecutionGraph;
  
  /** Compilation errors */
  errors: CompilationError[];
  
  /** Compilation warnings */
  warnings: CompilationWarning[];
}

/**
 * Compilation Error
 */
export interface CompilationError {
  /** Error code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Node ID (if applicable) */
  nodeId?: string;
  
  /** Edge ID (if applicable) */
  edgeId?: string;
  
  /** Path to problematic element */
  path?: string;
}

/**
 * Compilation Warning
 */
export interface CompilationWarning {
  /** Warning code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Node ID (if applicable) */
  nodeId?: string;
}
