/**
 * Custom Node Component
 * 
 * Custom React Flow node with styling based on node type
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeDefinition } from '@shared/node-definitions/types';

interface CustomNodeData {
  label: string;
  nodeType: string;
  definition?: NodeDefinition;
  config?: Record<string, unknown>;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const definition = data.definition;
  // Use Africa's Talking brand colors, fallback to node's color if defined
  const nodeColor = definition?.color || '#126DBF';
  const color = selected ? '#126DBF' : (nodeColor === '#6366f1' ? '#126DBF' : nodeColor);
  const category = definition?.category || 'action';

  // Determine node style based on category
  const getNodeStyle = () => {
    const baseStyle: React.CSSProperties = {
      padding: '12px 16px',
      borderRadius: '8px',
      border: `2px solid ${selected ? '#126DBF' : '#e5e7eb'}`,
      background: selected ? '#e6f2fb' : '#fff',
      minWidth: '150px',
      fontSize: '12px',
      boxShadow: selected 
        ? '0 0 0 3px rgba(18, 109, 191, 0.1), 0 4px 8px rgba(0,0,0,0.1)' 
        : '0 2px 4px rgba(0,0,0,0.08)',
      transition: 'all 0.2s ease',
    };

    return baseStyle;
  };

  return (
    <div style={getNodeStyle()}>
      {/* Input Handles */}
      {definition?.inputHandles && definition.inputHandles.length > 0 && (
        <>
          {definition.inputHandles.map((handle) => (
            <Handle
              key={handle.id}
              type="target"
              position={Position.Top}
              id={handle.id}
              style={{
                background: selected ? '#126DBF' : '#0B3B6A',
                width: '12px',
                height: '12px',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </>
      )}

      {/* Node Content */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontWeight: '600',
            color: selected ? '#126DBF' : '#0B3B6A',
            marginBottom: '4px',
            fontSize: '13px',
          }}
        >
          {data.label}
        </div>
        {definition && (
          <div
            style={{
              fontSize: '10px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '500',
            }}
          >
            {category}
          </div>
        )}
      </div>

      {/* Output Handles */}
      {definition?.outputHandles && definition.outputHandles.length > 0 && (
        <>
          {definition.outputHandles.length === 1 ? (
            <Handle
              type="source"
              position={Position.Bottom}
              id={definition.outputHandles[0].id}
              style={{
                background: selected ? '#126DBF' : '#0B3B6A',
                width: '12px',
                height: '12px',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          ) : (
            definition.outputHandles.map((handle, index) => (
              <Handle
                key={handle.id}
                type="source"
                position={Position.Bottom}
                id={handle.id}
                style={{
                  background: color,
                  width: '10px',
                  height: '10px',
                  left: `${(index + 1) * (100 / (definition.outputHandles.length + 1))}%`,
                }}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default CustomNode;
