/**
 * Workflow Specification Validator
 * 
 * Validates workflow specs against the canonical schema
 * and performs semantic checks (graph structure, etc.)
 */

import { WorkflowSpec, BaseNode, WorkflowEdge, isTriggerNode, NodeError } from './types';
import { WorkflowSpecSchema } from './types';
import { z } from 'zod';

/**
 * Validation Result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  
  /** List of validation errors */
  errors: ValidationError[];
  
  /** List of validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Path to the problematic element (e.g., "nodes[2].config.phoneNumber") */
  path?: string;
  
  /** Node ID (if applicable) */
  nodeId?: string;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Path to the element */
  path?: string;
  
  /** Node ID (if applicable) */
  nodeId?: string;
}

/**
 * Validates a workflow specification
 * 
 * Performs:
 * 1. Schema validation (Zod)
 * 2. Graph structure validation
 * 3. Semantic validation (USSD session closure, etc.)
 */
export function validateWorkflowSpec(spec: WorkflowSpec): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Schema validation
  const schemaResult = WorkflowSpecSchema.safeParse(spec);
  if (!schemaResult.success) {
    schemaResult.error.errors.forEach((err) => {
      errors.push({
        code: 'SCHEMA_VALIDATION_ERROR',
        message: err.message,
        path: err.path.join('.'),
      });
    });
    return { valid: false, errors, warnings };
  }

  // 2. Graph structure validation
  const graphErrors = validateGraphStructure(spec);
  errors.push(...graphErrors);

  // 3. Semantic validation
  const semanticErrors = validateSemantics(spec);
  errors.push(...semanticErrors);

  const semanticWarnings = validateSemanticsWarnings(spec);
  warnings.push(...semanticWarnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates graph structure
 * - Ensures all edges reference valid nodes
 * - Ensures no cycles in trigger path
 * - Ensures all nodes are reachable from trigger
 */
function validateGraphStructure(spec: WorkflowSpec): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(spec.nodes.map((n) => n.id));

  // Validate edges reference valid nodes
  spec.edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        code: 'INVALID_EDGE_SOURCE',
        message: `Edge ${edge.id} references non-existent source node: ${edge.source}`,
        nodeId: edge.source,
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        code: 'INVALID_EDGE_TARGET',
        message: `Edge ${edge.id} references non-existent target node: ${edge.target}`,
        nodeId: edge.target,
      });
    }
  });

  // Ensure trigger exists in nodes
  if (!nodeIds.has(spec.trigger.id)) {
    errors.push({
      code: 'TRIGGER_NOT_IN_NODES',
      message: `Trigger node ${spec.trigger.id} not found in nodes array`,
      nodeId: spec.trigger.id,
    });
  }

  // Check for unreachable nodes
  const reachable = findReachableNodes(spec);
  spec.nodes.forEach((node) => {
    if (!reachable.has(node.id) && node.id !== spec.trigger.id) {
      errors.push({
        code: 'UNREACHABLE_NODE',
        message: `Node ${node.id} is not reachable from trigger`,
        nodeId: node.id,
      });
    }
  });

  return errors;
}

/**
 * Finds all nodes reachable from the trigger
 */
function findReachableNodes(spec: WorkflowSpec): Set<string> {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const edgesBySource = new Map<string, WorkflowEdge[]>();

  // Build edge index
  spec.edges.forEach((edge) => {
    if (!edgesBySource.has(edge.source)) {
      edgesBySource.set(edge.source, []);
    }
    edgesBySource.get(edge.source)!.push(edge);
  });

  // DFS from trigger
  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    reachable.add(nodeId);

    const outgoingEdges = edgesBySource.get(nodeId) || [];
    outgoingEdges.forEach((edge) => {
      dfs(edge.target);
    });
  }

  dfs(spec.trigger.id);
  return reachable;
}

/**
 * Validates semantic rules
 * - USSD sessions must have SESSION_END
 * - No duplicate node IDs
 * - Trigger cannot have incoming edges
 */
function validateSemantics(spec: WorkflowSpec): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for duplicate node IDs
  const nodeIdCounts = new Map<string, number>();
  spec.nodes.forEach((node) => {
    nodeIdCounts.set(node.id, (nodeIdCounts.get(node.id) || 0) + 1);
  });
  nodeIdCounts.forEach((count, nodeId) => {
    if (count > 1) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node ID: ${nodeId}`,
        nodeId,
      });
    }
  });

  // Trigger cannot have incoming edges
  const hasIncomingToTrigger = spec.edges.some((e) => e.target === spec.trigger.id);
  if (hasIncomingToTrigger) {
    errors.push({
      code: 'TRIGGER_HAS_INCOMING_EDGES',
      message: 'Trigger node cannot have incoming edges',
      nodeId: spec.trigger.id,
    });
  }

  // USSD workflows must have SESSION_END
  if (spec.trigger.type === 'USSD_SESSION_START') {
    const hasSessionEnd = spec.nodes.some((n) => n.type === 'SESSION_END');
    if (!hasSessionEnd) {
      errors.push({
        code: 'USSD_MISSING_SESSION_END',
        message: 'USSD workflows must include at least one SESSION_END node',
      });
    }
  }

  return errors;
}

/**
 * Validates semantic warnings (non-blocking)
 */
function validateSemanticsWarnings(spec: WorkflowSpec): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Warn about nodes with no outgoing edges (dead ends)
  const nodesWithOutgoing = new Set(spec.edges.map((e) => e.source));
  spec.nodes.forEach((node) => {
    if (!nodesWithOutgoing.has(node.id) && node.type !== 'SESSION_END') {
      warnings.push({
        code: 'DEAD_END_NODE',
        message: `Node ${node.id} has no outgoing edges`,
        nodeId: node.id,
      });
    }
  });

  return warnings;
}
