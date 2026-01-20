/**
 * Node Config Panel Component
 * 
 * Panel for configuring selected node
 */

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { NodeDefinition } from '@shared/node-definitions/types';

interface NodeConfigPanelProps {
  node: Node;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onUpdateConfig, onClose }) => {
  const definition = node.data.definition as NodeDefinition;
  const [config, setConfig] = useState<Record<string, unknown>>(node.data.config || {});

  useEffect(() => {
    setConfig(node.data.config || {});
  }, [node]);

  const handleConfigChange = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateConfig(node.id, newConfig);
  };

  const renderConfigField = (key: string, schema: any) => {
    if (!schema || typeof schema !== 'object') return null;

    const value = config[key];
    const description = schema.description || key;

    // Handle different field types based on schema
    if (schema._def?.typeName === 'ZodString') {
      return (
        <div key={key} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {key}
          </label>
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            placeholder={description}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
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
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              {description}
            </div>
          )}
        </div>
      );
    }

    if (schema._def?.typeName === 'ZodNumber') {
      return (
        <div key={key} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {key}
          </label>
          <input
            type="number"
            value={(value as number) || 0}
            onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
            placeholder={description}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
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
        </div>
      );
    }

    if (schema._def?.typeName === 'ZodBoolean') {
      return (
        <div key={key} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            {key}
          </label>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', marginLeft: '24px' }}>
              {description}
            </div>
          )}
        </div>
      );
    }

    if (schema._def?.typeName === 'ZodEnum') {
      const options = schema._def.values;
      return (
        <div key={key} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {key}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              transition: 'border-color 0.2s ease',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#126DBF';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  };

  const schemaShape = definition.configSchema._def?.shape || {};

  return (
    <div
      style={{
        width: '300px',
        height: '100vh',
        overflowY: 'auto',
        background: '#fff',
        borderLeft: '2px solid #e6f2fb',
        padding: '16px',
        boxShadow: '-2px 0 4px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e6f2fb' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0B3B6A' }}>{definition.name}</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e6f2fb';
            e.currentTarget.style.color = '#126DBF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#666';
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666', lineHeight: '1.5', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
        {definition.description}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0B3B6A' }}>Configuration</h3>
        {Object.entries(schemaShape).map(([key, schema]) => renderConfigField(key, schema))}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#0B3B6A' }}>Node Info</h3>
        <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '4px' }}><strong>Type:</strong> {definition.type}</div>
          <div style={{ marginBottom: '4px' }}><strong>Category:</strong> {definition.category}</div>
          <div><strong>Node ID:</strong> {node.id}</div>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
