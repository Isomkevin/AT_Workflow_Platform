/**
 * Workflow Compiler
 * 
 * Compiles a WorkflowSpec into an ExecutionGraph that can be efficiently executed.
 * 
 * Responsibilities:
 * 1. Validate workflow spec against node definitions
 * 2. Build execution graph with metadata
 * 3. Topologically sort nodes for execution order
 * 4. Detect cycles and unreachable nodes
 * 5. Validate node configurations
 * 6. Enforce semantic rules (e.g., USSD session closure)
 */

import { WorkflowSpec, BaseNode, WorkflowEdge } from '../../shared/workflow-spec/types';
import { validateWorkflowSpec } from '../../shared/workflow-spec/validator';
import { nodeRegistry, NodeDefinition } from '../../shared/node-definitions';
import {
  ExecutionGraph,
  ExecutionNode,
  ExecutionEdge,
  CompilationResult,
  CompilationError,
  CompilationWarning,
} from './types';

/**
 * Compiles a workflow specification into an execution graph
 */
export function compileWorkflow(spec: WorkflowSpec): CompilationResult {
  const errors: CompilationError[] = [];
  const warnings: CompilationWarning[] = [];

  // 1. Validate workflow spec structure
  const validationResult = validateWorkflowSpec(spec);
  if (!validationResult.valid) {
    return {
      success: false,
      errors: validationResult.errors.map((err) => ({
        code: err.code,
        message: err.message,
        nodeId: err.nodeId,
        path: err.path,
      })),
      warnings: validationResult.warnings.map((warn) => ({
        code: warn.code,
        message: warn.message,
        nodeId: warn.nodeId,
      })),
    };
  }

  warnings.push(...validationResult.warnings.map((warn) => ({
    code: warn.code,
    message: warn.message,
    nodeId: warn.nodeId,
  })));

  // 2. Validate all nodes exist in registry
  const nodeDefinitions = new Map<string, NodeDefinition>();
  for (const node of spec.nodes) {
    const definition = nodeRegistry.get(node.type);
    if (!definition) {
      errors.push({
        code: 'UNKNOWN_NODE_TYPE',
        message: `Unknown node type: ${node.type}`,
        nodeId: node.id,
      });
      continue;
    }
    nodeDefinitions.set(node.id, definition);
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  // 3. Validate node configurations
  for (const node of spec.nodes) {
    const definition = nodeDefinitions.get(node.id)!;
    const validationResult = nodeRegistry.validateConfig(node.type, node.config, {
      workflowId: spec.metadata.workflowId,
      allNodes: spec.nodes.map((n) => ({ id: n.id, type: n.type })),
    });

    if (!validationResult.valid) {
      errors.push(...validationResult.errors.map((err) => ({
        code: 'NODE_CONFIG_VALIDATION_ERROR',
        message: `Node ${node.id}: ${err.message}`,
        nodeId: node.id,
        path: err.field,
      })));
    }
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  // 4. Build execution graph
  try {
    const graph = buildExecutionGraph(spec, nodeDefinitions);
    
    // 5. Validate graph structure
    const graphErrors = validateExecutionGraph(graph);
    errors.push(...graphErrors);

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    return {
      success: true,
      graph,
      errors: [],
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        code: 'COMPILATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown compilation error',
      }],
      warnings,
    };
  }
}

/**
 * Builds an execution graph from a workflow spec
 */
function buildExecutionGraph(
  spec: WorkflowSpec,
  nodeDefinitions: Map<string, NodeDefinition>
): ExecutionGraph {
  const nodes = new Map<string, ExecutionNode>();
  const edges: ExecutionEdge[] = [];

  // Build node map
  for (const node of spec.nodes) {
    const definition = nodeDefinitions.get(node.id)!;
    
    const executionNode: ExecutionNode = {
      id: node.id,
      type: node.type,
      definition,
      config: node.config,
      retry: node.retry || definition.defaultRetry,
      timeout: node.timeout || definition.defaultTimeout || 30000,
      disabled: node.disabled || false,
      incomingEdges: [],
      outgoingEdges: [],
      metadata: {
        requiresSession: definition.requiresSession || false,
        endsSession: definition.endsSession || false,
        executionOrder: 0, // Will be set during topological sort
      },
    };

    nodes.set(node.id, executionNode);
  }

  // Build edge map
  const edgesBySource = new Map<string, ExecutionEdge[]>();
  const edgesByTarget = new Map<string, ExecutionEdge[]>();

  for (const edge of spec.edges) {
    const executionEdge: ExecutionEdge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      condition: edge.condition,
      label: edge.label,
      metadata: {
        isConditional: !!edge.condition,
        priority: 0, // Can be enhanced with priority logic
      },
    };

    edges.push(executionEdge);

    // Index by source
    if (!edgesBySource.has(edge.source)) {
      edgesBySource.set(edge.source, []);
    }
    edgesBySource.get(edge.source)!.push(executionEdge);

    // Index by target
    if (!edgesByTarget.has(edge.target)) {
      edgesByTarget.set(edge.target, []);
    }
    edgesByTarget.get(edge.target)!.push(executionEdge);
  }

  // Link nodes with edges
  for (const [nodeId, node] of nodes.entries()) {
    node.incomingEdges = edgesByTarget.get(nodeId) || [];
    node.outgoingEdges = edgesBySource.get(nodeId) || [];
  }

  // Topological sort to determine execution order
  const executionOrder = topologicalSort(nodes, spec.trigger.id);

  // Set execution order on nodes
  executionOrder.forEach((nodeId, index) => {
    const node = nodes.get(nodeId);
    if (node) {
      node.metadata.executionOrder = index;
    }
  });

  // Build graph metadata
  const triggerNode = nodes.get(spec.trigger.id)!;
  const hasSessionEnd = Array.from(nodes.values()).some((n) => n.metadata.endsSession);
  const requiresSession = triggerNode.metadata.requiresSession || 
    Array.from(nodes.values()).some((n) => n.metadata.requiresSession);

  return {
    workflowId: spec.metadata.workflowId,
    workflowVersion: spec.metadata.version,
    trigger: triggerNode,
    nodes,
    executionOrder,
    metadata: {
      requiresSession,
      hasSessionEnd,
      maxDepth: calculateMaxDepth(nodes, spec.trigger.id),
      hasCycles: false, // Topological sort would fail if cycles exist
    },
  };
}

/**
 * Topologically sorts nodes starting from trigger
 * Returns node IDs in execution order
 */
function topologicalSort(nodes: Map<string, ExecutionNode>, startNodeId: string): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: string[] = [];

  function visit(nodeId: string): void {
    if (visiting.has(nodeId)) {
      throw new Error(`Cycle detected in workflow graph at node: ${nodeId}`);
    }
    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    const node = nodes.get(nodeId);
    if (node) {
      // Visit all outgoing targets first
      for (const edge of node.outgoingEdges) {
        visit(edge.target);
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    result.push(nodeId);
  }

  visit(startNodeId);

  // Reverse to get execution order (dependencies first)
  return result.reverse();
}

/**
 * Calculates maximum depth of the graph from trigger
 */
function calculateMaxDepth(nodes: Map<string, ExecutionNode>, startNodeId: string): number {
  const depths = new Map<string, number>();

  function calculateDepth(nodeId: string): number {
    if (depths.has(nodeId)) {
      return depths.get(nodeId)!;
    }

    const node = nodes.get(nodeId);
    if (!node || node.outgoingEdges.length === 0) {
      depths.set(nodeId, 0);
      return 0;
    }

    const maxChildDepth = Math.max(
      ...node.outgoingEdges.map((edge) => calculateDepth(edge.target))
    );

    const depth = maxChildDepth + 1;
    depths.set(nodeId, depth);
    return depth;
  }

  return calculateDepth(startNodeId);
}

/**
 * Validates execution graph for semantic correctness
 */
function validateExecutionGraph(graph: ExecutionGraph): CompilationError[] {
  const errors: CompilationError[] = [];

  // Validate that trigger has no incoming edges
  if (graph.trigger.incomingEdges.length > 0) {
    errors.push({
      code: 'TRIGGER_HAS_INCOMING_EDGES',
      message: 'Trigger node cannot have incoming edges',
      nodeId: graph.trigger.id,
    });
  }

  // Validate USSD workflows have session end
  if (graph.trigger.type === 'USSD_SESSION_START' && !graph.metadata.hasSessionEnd) {
    errors.push({
      code: 'USSD_MISSING_SESSION_END',
      message: 'USSD workflows must include at least one SESSION_END node',
    });
  }

  // Validate node connections are allowed
  for (const [nodeId, node] of graph.nodes.entries()) {
    // Check incoming node types
    if (node.definition.allowedIncomingTypes && node.definition.allowedIncomingTypes.length > 0) {
      for (const edge of node.incomingEdges) {
        const sourceNode = graph.nodes.get(edge.source);
        if (sourceNode && !node.definition.allowedIncomingTypes.includes(sourceNode.type)) {
          errors.push({
            code: 'INVALID_NODE_CONNECTION',
            message: `Node ${nodeId} (${node.type}) cannot receive input from ${sourceNode.type}`,
            nodeId,
            edgeId: edge.id,
          });
        }
      }
    }

    // Check outgoing node types
    if (node.definition.allowedOutgoingTypes && node.definition.allowedOutgoingTypes.length > 0) {
      for (const edge of node.outgoingEdges) {
        const targetNode = graph.nodes.get(edge.target);
        if (targetNode && !node.definition.allowedOutgoingTypes.includes(targetNode.type)) {
          errors.push({
            code: 'INVALID_NODE_CONNECTION',
            message: `Node ${nodeId} (${node.type}) cannot connect to ${targetNode.type}`,
            nodeId,
            edgeId: edge.id,
          });
        }
      }
    }
  }

  return errors;
}
