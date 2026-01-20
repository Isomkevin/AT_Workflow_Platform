/**
 * Node Definitions - Type System
 * 
 * Defines all available node types, their schemas, validation rules,
 * and execution contracts.
 * 
 * Each node type must define:
 * - Input schema (what data it expects)
 * - Output schema (what data it produces)
 * - Validation rules
 * - Allowed incoming/outgoing edge types
 * - Execution metadata
 */

import { z } from 'zod';

/**
 * Node Category
 */
export type NodeCategory = 'trigger' | 'action' | 'logic' | 'state';

/**
 * Node Handle Type
 * Defines connection points on a node
 */
export interface NodeHandle {
  /** Handle ID (unique within node) */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Handle type */
  type: 'input' | 'output';
  
  /** Data type expected/produced */
  dataType: 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  /** Whether this handle is required */
  required?: boolean;
}

/**
 * Node Definition
 * Complete specification for a node type
 */
export interface NodeDefinition {
  /** Unique node type identifier */
  type: string;
  
  /** Human-readable name */
  name: string;
  
  /** Category */
  category: NodeCategory;
  
  /** Description */
  description: string;
  
  /** Icon identifier (for UI) */
  icon?: string;
  
  /** Color (hex) for UI */
  color: string;
  
  /** Input handles (connection points) */
  inputHandles: NodeHandle[];
  
  /** Output handles (connection points) */
  outputHandles: NodeHandle[];
  
  /** Configuration schema (Zod) */
  configSchema: z.ZodSchema;
  
  /** Input data schema (what the node expects from previous nodes) */
  inputSchema?: z.ZodSchema;
  
  /** Output data schema (what the node produces) */
  outputSchema?: z.ZodSchema;
  
  /** Validation function (custom validation beyond schema) */
  validate?: (config: unknown, context?: ValidationContext) => ValidationResult;
  
  /** Whether this node can have multiple incoming edges */
  allowMultipleInputs?: boolean;
  
  /** Whether this node can have multiple outgoing edges */
  allowMultipleOutputs?: boolean;
  
  /** Allowed incoming node types (empty = any) */
  allowedIncomingTypes?: string[];
  
  /** Allowed outgoing node types (empty = any) */
  allowedOutgoingTypes?: string[];
  
  /** Whether this node requires session state */
  requiresSession?: boolean;
  
  /** Whether this node ends a session */
  endsSession?: boolean;
  
  /** Default timeout in milliseconds */
  defaultTimeout?: number;
  
  /** Default retry configuration */
  defaultRetry?: {
    maxAttempts: number;
    initialDelayMs: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
  };
}

/**
 * Validation Context
 * Additional context for node validation
 */
export interface ValidationContext {
  /** Workflow being validated */
  workflowId?: string;
  
  /** Other nodes in the workflow */
  allNodes?: Array<{ id: string; type: string }>;
  
  /** Session type (if applicable) */
  sessionType?: 'ussd' | 'voice' | 'sms' | 'payment';
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings?: Array<{ field: string; message: string }>;
}

/**
 * Node Registry
 * Central registry of all node definitions
 */
export class NodeRegistry {
  private definitions = new Map<string, NodeDefinition>();

  /**
   * Register a node definition
   */
  register(definition: NodeDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Node type ${definition.type} is already registered`);
    }
    this.definitions.set(definition.type, definition);
  }

  /**
   * Get a node definition by type
   */
  get(type: string): NodeDefinition | undefined {
    return this.definitions.get(type);
  }

  /**
   * Get all node definitions
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get node definitions by category
   */
  getByCategory(category: NodeCategory): NodeDefinition[] {
    return this.getAll().filter((def) => def.category === category);
  }

  /**
   * Validate node configuration
   */
  validateConfig(type: string, config: unknown, context?: ValidationContext): ValidationResult {
    const definition = this.get(type);
    if (!definition) {
      return {
        valid: false,
        errors: [{ field: 'type', message: `Unknown node type: ${type}` }],
      };
    }

    // Schema validation
    const schemaResult = definition.configSchema.safeParse(config);
    if (!schemaResult.success) {
      return {
        valid: false,
        errors: schemaResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }

    // Custom validation
    if (definition.validate) {
      return definition.validate(config, context);
    }

    return { valid: true, errors: [] };
  }
}

/**
 * Global node registry instance
 */
export const nodeRegistry = new NodeRegistry();
