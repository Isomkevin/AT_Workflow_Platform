/**
 * Node Config Panel Component
 * 
 * Panel for configuring selected node with support for complex types
 */

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { NodeDefinition } from '@shared/node-definitions/types';
import { z } from 'zod';

interface NodeConfigPanelProps {
  node: Node;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>) => void;
  onUpdateLabel?: (nodeId: string, label: string) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onUpdateConfig, onUpdateLabel, onClose }) => {
  const definition = node.data.definition as NodeDefinition;
  const [config, setConfig] = useState<Record<string, unknown>>(node.data.config || {});
  const [label, setLabel] = useState<string>(node.data.label || definition.name);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || definition.name);
    validateConfig(node.data.config || {});
  }, [node, definition.name]);

  const validateConfig = (configToValidate: Record<string, unknown>) => {
    try {
      const result = definition.configSchema.safeParse(configToValidate);
      const errors: Record<string, string> = {};
      
      if (!result.success) {
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      
      setValidationErrors(errors);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleConfigChange = (key: string, value: unknown, path: string[] = []) => {
    let newConfig: Record<string, unknown>;
    
    if (path.length > 0) {
      // Nested update
      newConfig = { ...config };
      let current: any = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    } else {
      newConfig = { ...config, [key]: value };
    }
    
    setConfig(newConfig);
    validateConfig(newConfig);
    onUpdateConfig(node.id, newConfig);
  };

  const getNestedValue = (obj: Record<string, unknown>, path: string[]): unknown => {
    let current: any = obj;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const getDefaultValue = (schema: z.ZodTypeAny): unknown => {
    if (schema._def?.typeName === 'ZodDefault') {
      return schema._def.defaultValue();
    }
    if (schema._def?.typeName === 'ZodOptional') {
      return undefined;
    }
    if (schema._def?.typeName === 'ZodObject') {
      return {};
    }
    if (schema._def?.typeName === 'ZodArray') {
      return [];
    }
    if (schema._def?.typeName === 'ZodBoolean') {
      return false;
    }
    if (schema._def?.typeName === 'ZodNumber') {
      return 0;
    }
    if (schema._def?.typeName === 'ZodString') {
      return '';
    }
    return undefined;
  };

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const renderConfigField = (key: string, schema: z.ZodTypeAny, path: string[] = []): React.ReactNode => {
    if (!schema) return null;

    const fullPath = [...path, key];
    const pathKey = fullPath.join('.');
    const value = getNestedValue(config, fullPath);
    const error = validationErrors[pathKey];
    const isExpanded = expandedSections.has(pathKey);

    // Handle ZodDefault (unwrap default)
    let actualSchema = schema;
    if (schema._def?.typeName === 'ZodDefault') {
      actualSchema = schema._def.innerType;
    }

    // Handle ZodOptional (unwrap optional)
    if (actualSchema._def?.typeName === 'ZodOptional') {
      actualSchema = actualSchema._def.innerType;
    }

    const typeName = actualSchema._def?.typeName;
    const description = actualSchema.description || key;

    // Nested Object
    if (typeName === 'ZodObject') {
      const shape = actualSchema._def.shape();
      const objValue = (value as Record<string, unknown>) || {};
      const hasError = error !== undefined;

      return (
        <div key={pathKey} style={{ marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: isExpanded ? '8px' : '0',
            }}
            onClick={() => toggleSection(pathKey)}
          >
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
              {key}
            </label>
            <span style={{ fontSize: '12px', color: '#666' }}>{isExpanded ? '▼' : '▶'}</span>
          </div>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>{description}</div>
          )}
          {isExpanded && (
            <div style={{ marginLeft: '8px', borderLeft: '2px solid #e6f2fb', paddingLeft: '8px' }}>
              {Object.entries(shape).map(([subKey, subSchema]) =>
                renderConfigField(subKey, subSchema as z.ZodTypeAny, fullPath)
              )}
            </div>
          )}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    // Array
    if (typeName === 'ZodArray') {
      const itemSchema = actualSchema._def.type;
      const arrValue = (value as unknown[]) || [];
      const hasError = error !== undefined;

      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
            {key}
          </label>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{description}</div>
          )}
          {arrValue.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
              {itemSchema._def?.typeName === 'ZodObject' ? (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Item {index + 1}</div>
                  {Object.entries(itemSchema._def.shape()).map(([subKey, subSchema]) =>
                    renderConfigField(subKey, subSchema as z.ZodTypeAny, [...fullPath, index.toString()])
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={String(item)}
                  onChange={(e) => {
                    const newArr = [...arrValue];
                    newArr[index] = e.target.value;
                    handleConfigChange(key, newArr, path);
                  }}
                  style={{ width: '100%', padding: '4px', fontSize: '11px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
              )}
              <button
                onClick={() => {
                  const newArr = arrValue.filter((_, i) => i !== index);
                  handleConfigChange(key, newArr, path);
                }}
                style={{ marginTop: '4px', padding: '2px 6px', fontSize: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newArr = [...arrValue, getDefaultValue(itemSchema)];
              handleConfigChange(key, newArr, path);
            }}
            style={{ padding: '4px 8px', fontSize: '11px', background: '#126DBF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Item
          </button>
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    // String
    if (typeName === 'ZodString') {
      const isUrl = description.toLowerCase().includes('url') || key.toLowerCase().includes('url');
      const hasError = error !== undefined;

      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
            {key}
          </label>
          <input
            type={isUrl ? 'url' : 'text'}
            value={(value as string) || ''}
            onChange={(e) => handleConfigChange(key, e.target.value, path)}
            placeholder={description}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '4px',
              fontSize: '12px',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#126DBF';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = hasError ? '#ef4444' : '#e5e7eb';
            }}
          />
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{description}</div>
          )}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    // Number
    if (typeName === 'ZodNumber') {
      const hasError = error !== undefined;
      const min = actualSchema._def.checks?.find((c: any) => c.kind === 'min')?.value;
      const max = actualSchema._def.checks?.find((c: any) => c.kind === 'max')?.value;

      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
            {key} {min !== undefined && max !== undefined && `(${min}-${max})`}
          </label>
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => {
              const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
              handleConfigChange(key, numValue, path);
            }}
            min={min}
            max={max}
            placeholder={description}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '4px',
              fontSize: '12px',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#126DBF';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = hasError ? '#ef4444' : '#e5e7eb';
            }}
          />
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{description}</div>
          )}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    // Boolean
    if (typeName === 'ZodBoolean') {
      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => handleConfigChange(key, e.target.checked, path)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold', color: error ? '#ef4444' : '#0B3B6A' }}>{key}</span>
          </label>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', marginLeft: '24px' }}>
              {description}
            </div>
          )}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', marginLeft: '24px' }}>{error}</div>
          )}
        </div>
      );
    }

    // Enum
    if (typeName === 'ZodEnum') {
      const options = actualSchema._def.values;
      const hasError = error !== undefined;

      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
            {key}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => handleConfigChange(key, e.target.value, path)}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
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
              e.currentTarget.style.borderColor = hasError ? '#ef4444' : '#e5e7eb';
            }}
          >
            <option value="">Select...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{description}</div>
          )}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    // Record (key-value pairs)
    if (typeName === 'ZodRecord') {
      const recordValue = (value as Record<string, unknown>) || {};
      const hasError = error !== undefined;

      return (
        <div key={pathKey} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: hasError ? '#ef4444' : '#0B3B6A' }}>
            {key}
          </label>
          {description && (
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{description}</div>
          )}
          {Object.entries(recordValue).map(([recordKey, recordVal]) => (
            <div key={recordKey} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input
                type="text"
                value={recordKey}
                readOnly
                style={{ flex: '1', padding: '4px', fontSize: '11px', border: '1px solid #e5e7eb', borderRadius: '4px', background: '#f9fafb' }}
              />
              <input
                type="text"
                value={String(recordVal)}
                onChange={(e) => {
                  const newRecord = { ...recordValue, [recordKey]: e.target.value };
                  handleConfigChange(key, newRecord, path);
                }}
                style={{ flex: '2', padding: '4px', fontSize: '11px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              />
              <button
                onClick={() => {
                  const newRecord = { ...recordValue };
                  delete newRecord[recordKey];
                  handleConfigChange(key, newRecord, path);
                }}
                style={{ padding: '4px 8px', fontSize: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newKey = `key${Object.keys(recordValue).length + 1}`;
              const newRecord = { ...recordValue, [newKey]: '' };
              handleConfigChange(key, newRecord, path);
            }}
            style={{ padding: '4px 8px', fontSize: '11px', background: '#126DBF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Entry
          </button>
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</div>
          )}
        </div>
      );
    }

    return null;
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (onUpdateLabel) {
      onUpdateLabel(node.id, newLabel);
    }
  };

  const isTrigger = node.data.nodeType?.toString().startsWith('SMS_RECEIVED') || 
                    node.data.nodeType?.toString().startsWith('USSD_SESSION_START') ||
                    node.data.nodeType?.toString().startsWith('INCOMING_CALL') ||
                    node.data.nodeType?.toString().startsWith('PAYMENT_CALLBACK') ||
                    node.data.nodeType?.toString().startsWith('SCHEDULED') ||
                    node.data.nodeType?.toString().startsWith('HTTP_WEBHOOK');

  const schemaShape = definition.configSchema._def?.shape || {};

  return (
    <div
      style={{
        width: '350px',
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

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0B3B6A' }}>Node Label</h3>
        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="Node label"
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
        {isTrigger && (
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', fontStyle: 'italic' }}>
            ⚠️ Trigger nodes cannot be deleted
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0B3B6A' }}>Configuration</h3>
        {Object.keys(schemaShape).length === 0 ? (
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No configuration required</div>
        ) : (
          Object.entries(schemaShape).map(([key, schema]) => renderConfigField(key, schema as z.ZodTypeAny))
        )}
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
