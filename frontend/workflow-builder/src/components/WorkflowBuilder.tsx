/**
 * Workflow Builder Component
 * 
 * Main React Flow-based workflow builder
 */

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowSpec } from '@shared/workflow-spec/types';
import NodePanel from './NodePanel';
import NodeConfigPanel from './NodeConfigPanel';
import { nodeRegistry } from '@shared/node-definitions';
import { initializeNodeDefinitions } from '@shared/node-definitions';
import CustomNode from './CustomNode';

// Initialize node definitions
initializeNodeDefinitions();

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');

  // Initialize with trigger node
  React.useEffect(() => {
    const triggerNode: Node = {
      id: 'trigger-1',
      type: 'custom',
      position: { x: 250, y: 100 },
      data: {
        label: 'SMS Received',
        nodeType: 'SMS_RECEIVED',
        definition: nodeRegistry.get('SMS_RECEIVED'),
        config: {},
      },
    };
    setNodes([triggerNode]);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    // Check if any deleted node is a trigger node
    const hasTrigger = deleted.some(node => {
      const nodeType = node.data.nodeType as string;
      return nodeType?.startsWith('SMS_RECEIVED') || 
             nodeType?.startsWith('USSD_SESSION_START') ||
             nodeType?.startsWith('INCOMING_CALL') ||
             nodeType?.startsWith('PAYMENT_CALLBACK') ||
             nodeType?.startsWith('SCHEDULED') ||
             nodeType?.startsWith('HTTP_WEBHOOK');
    });

    if (hasTrigger) {
      alert('Trigger nodes cannot be deleted');
      return;
    }

    // Remove edges connected to deleted nodes
    const deletedIds = new Set(deleted.map(n => n.id));
    setEdges((eds) => eds.filter(
      edge => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
    ));

    // Clear selection if deleted node was selected
    if (selectedNode && deletedIds.has(selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [setEdges, selectedNode]);

  const handleAddNode = useCallback((nodeType: string) => {
    const definition = nodeRegistry.get(nodeType);
    if (!definition) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500 + 250, y: Math.random() * 400 + 200 },
      data: {
        label: definition.name,
        nodeType: nodeType,
        definition,
        config: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleUpdateNodeConfig = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config,
              },
            }
          : node
      )
    );
  }, [setNodes]);

  const handleUpdateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label,
              },
            }
          : node
      )
    );
  }, [setNodes]);

  const handleSaveWorkflow = useCallback(async () => {
    // Build workflow spec from nodes and edges
    const triggerNode = nodes.find((n) => n.data.nodeType?.startsWith('SMS_RECEIVED') || 
                                         n.data.nodeType?.startsWith('USSD_SESSION_START') ||
                                         n.data.nodeType?.startsWith('INCOMING_CALL') ||
                                         n.data.nodeType?.startsWith('PAYMENT_CALLBACK') ||
                                         n.data.nodeType?.startsWith('SCHEDULED') ||
                                         n.data.nodeType?.startsWith('HTTP_WEBHOOK'));

    if (!triggerNode) {
      alert('Workflow must have a trigger node');
      return;
    }

    const workflowSpec: WorkflowSpec = {
      metadata: {
        workflowId: `workflow-${Date.now()}`,
        version: 1,
        name: workflowName,
        createdBy: 'user',
        createdAt: new Date().toISOString(),
      },
      trigger: {
        id: triggerNode.id,
        type: triggerNode.data.nodeType,
        label: triggerNode.data.label,
        config: triggerNode.data.config || {},
        position: triggerNode.position,
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.nodeType,
        label: node.data.label,
        config: node.data.config || {},
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        condition: edge.data?.condition,
        label: edge.label,
      })),
    };

    try {
      const response = await fetch('/api/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowSpec),
      });

      const result = await response.json();
      if (result.valid) {
        alert('Workflow saved successfully!');
      } else {
        alert(`Validation errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  }, [nodes, edges, workflowName]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Node Panel */}
      <NodePanel onAddNode={handleAddNode} />

      {/* Main Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          nodesDeletable={true}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          deleteKeyCode="Delete"
          fitView
          snapToGrid
          snapGrid={[20, 20]}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {/* Toolbar */}
        <div style={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e6f2fb',
        }}>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#0B3B6A',
              minWidth: '200px',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#126DBF';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          />
          <button 
            onClick={handleSaveWorkflow} 
            style={{ 
              padding: '8px 16px',
              background: '#126DBF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(18, 109, 191, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0B3B6A';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(18, 109, 191, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#126DBF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(18, 109, 191, 0.2)';
            }}
          >
            Save Workflow
          </button>
        </div>

        {/* Tip Message */}
        <div style={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e6f2fb',
          fontSize: '12px',
          color: '#666',
        }}>
          💡 Tip: Select a node and press <strong>Delete</strong> to remove it. Click a node to customize its label and configuration.
        </div>
      </div>

      {/* Config Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdateConfig={handleUpdateNodeConfig}
          onUpdateLabel={handleUpdateNodeLabel}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
