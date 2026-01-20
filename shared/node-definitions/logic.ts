/**
 * Logic Node Definitions
 * 
 * Logic nodes control workflow flow (conditions, switches, delays, etc.)
 */

import { z } from 'zod';
import { NodeDefinition, nodeRegistry, ValidationContext, ValidationResult } from './types';

/**
 * CONDITION Node
 * Branches workflow based on a condition
 */
const conditionNode: NodeDefinition = {
  type: 'CONDITION',
  name: 'Condition',
  category: 'logic',
  description: 'Branches workflow based on a boolean condition',
  icon: 'git-branch',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'true',
      label: 'True',
      type: 'output',
      dataType: 'any',
    },
    {
      id: 'false',
      label: 'False',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    expression: z.string().min(1).describe('JavaScript-like expression (e.g., "{{amount}} > 100")'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 1000,
};

/**
 * SWITCH Node
 * Branches workflow based on multiple conditions
 */
const switchNode: NodeDefinition = {
  type: 'SWITCH',
  name: 'Switch',
  category: 'logic',
  description: 'Branches workflow based on value matching (like switch/case)',
  icon: 'git-merge',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'default',
      label: 'Default',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    value: z.string().describe('Value to match (supports {{variable}} syntax)'),
    cases: z.array(z.object({
      value: z.string().describe('Case value to match'),
      label: z.string().describe('Case label'),
    })).min(1).describe('List of cases'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 1000,
};

/**
 * DELAY Node
 * Pauses workflow execution for a specified duration
 */
const delayNode: NodeDefinition = {
  type: 'DELAY',
  name: 'Delay',
  category: 'logic',
  description: 'Pauses workflow execution for a specified duration',
  icon: 'clock',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'default',
      label: 'Output',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    duration: z.number().int().positive().describe('Delay duration in milliseconds'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: false,
  allowMultipleOutputs: false,
  defaultTimeout: 300000, // 5 minutes max
};

/**
 * RETRY Node
 * Retries a failed operation with backoff
 */
const retryNode: NodeDefinition = {
  type: 'RETRY',
  name: 'Retry',
  category: 'logic',
  description: 'Retries execution if the next node fails',
  icon: 'refresh-cw',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'success',
      label: 'Success',
      type: 'output',
      dataType: 'any',
    },
    {
      id: 'max_retries',
      label: 'Max Retries Reached',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    maxAttempts: z.number().int().min(1).max(10).default(3).describe('Maximum retry attempts'),
    initialDelayMs: z.number().int().nonnegative().default(1000).describe('Initial delay in milliseconds'),
    backoffMultiplier: z.number().positive().default(2).describe('Exponential backoff multiplier'),
    maxDelayMs: z.number().int().positive().optional().describe('Maximum delay cap'),
    retryableErrors: z.array(z.string()).optional().describe('Error codes to retry on'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 300000,
};

/**
 * RATE_LIMIT Node
 * Rate limits execution flow
 */
const rateLimitNode: NodeDefinition = {
  type: 'RATE_LIMIT',
  name: 'Rate Limit',
  category: 'logic',
  description: 'Rate limits execution to prevent exceeding API limits',
  icon: 'gauge',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'default',
      label: 'Output',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    maxRequests: z.number().int().positive().describe('Maximum requests per window'),
    windowMs: z.number().int().positive().describe('Time window in milliseconds'),
    strategy: z.enum(['fixed', 'sliding']).default('fixed').describe('Rate limit strategy'),
    key: z.string().optional().describe('Rate limit key (defaults to execution ID)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: false,
  allowMultipleOutputs: false,
  defaultTimeout: 60000,
};

/**
 * MERGE Node
 * Merges multiple execution paths
 */
const mergeNode: NodeDefinition = {
  type: 'MERGE',
  name: 'Merge',
  category: 'logic',
  description: 'Merges multiple execution paths into one',
  icon: 'git-merge',
  color: '#6366f1',
  inputHandles: [
    {
      id: 'input1',
      label: 'Input 1',
      type: 'input',
      dataType: 'any',
    },
    {
      id: 'input2',
      label: 'Input 2',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [
    {
      id: 'default',
      label: 'Output',
      type: 'output',
      dataType: 'any',
    },
  ],
  configSchema: z.object({
    strategy: z.enum(['first', 'last', 'all', 'merge']).default('last').describe('Merge strategy'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  allowMultipleInputs: true,
  allowMultipleOutputs: false,
  defaultTimeout: 1000,
};

/**
 * Register all logic nodes
 */
export function registerLogicNodes(): void {
  nodeRegistry.register(conditionNode);
  nodeRegistry.register(switchNode);
  nodeRegistry.register(delayNode);
  nodeRegistry.register(retryNode);
  nodeRegistry.register(rateLimitNode);
  nodeRegistry.register(mergeNode);
}
