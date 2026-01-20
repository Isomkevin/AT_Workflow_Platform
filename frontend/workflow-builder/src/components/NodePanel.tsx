/**
 * Node Panel Component
 * 
 * Sidebar for adding nodes to the workflow
 */

import React from 'react';
import { nodeRegistry } from '@shared/node-definitions';

interface NodePanelProps {
  onAddNode: (nodeType: string) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ onAddNode }) => {
  const triggers = nodeRegistry.getByCategory('trigger');
  const actions = nodeRegistry.getByCategory('action');
  const logic = nodeRegistry.getByCategory('logic');
  const state = nodeRegistry.getByCategory('state');

  const renderNodeGroup = (title: string, nodes: typeof triggers) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#0B3B6A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      {nodes.map((nodeDef) => (
        <div
          key={nodeDef.type}
          onClick={() => onAddNode(nodeDef.type)}
          style={{
            padding: '10px',
            marginBottom: '4px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e6f2fb';
            e.currentTarget.style.borderColor = '#126DBF';
            e.currentTarget.style.transform = 'translateX(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{ fontWeight: '600', color: nodeDef.color || '#126DBF', marginBottom: '2px' }}>
            {nodeDef.name}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: '1.4' }}>
            {nodeDef.description}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        width: '250px',
        height: '100vh',
        overflowY: 'auto',
        background: '#fff',
        borderRight: '2px solid #e6f2fb',
        padding: '16px',
        boxShadow: '2px 0 4px rgba(0,0,0,0.02)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700', color: '#0B3B6A' }}>Nodes</h2>
      {renderNodeGroup('Triggers', triggers)}
      {renderNodeGroup('Actions', actions)}
      {renderNodeGroup('Logic', logic)}
      {renderNodeGroup('State', state)}
    </div>
  );
};

export default NodePanel;
