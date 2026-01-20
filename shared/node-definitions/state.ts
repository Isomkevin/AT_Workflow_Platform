/**
 * State Node Definitions
 * 
 * State nodes manage session and workflow state
 */

import { z } from 'zod';
import { NodeDefinition, nodeRegistry, ValidationContext, ValidationResult } from './types';

/**
 * SESSION_READ Node
 * Reads data from the current session
 */
const sessionReadNode: NodeDefinition = {
  type: 'SESSION_READ',
  name: 'Read Session',
  category: 'state',
  description: 'Reads data from the current session state',
  icon: 'database',
  color: '#06b6d4',
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
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    keys: z.array(z.string()).optional().describe('Specific keys to read (reads all if not specified)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    sessionData: z.record(z.unknown()).describe('Session data'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: false,
  defaultTimeout: 1000,
};

/**
 * SESSION_WRITE Node
 * Writes data to the current session
 */
const sessionWriteNode: NodeDefinition = {
  type: 'SESSION_WRITE',
  name: 'Write Session',
  category: 'state',
  description: 'Writes data to the current session state',
  icon: 'save',
  color: '#06b6d4',
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
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    data: z.record(z.string()).describe('Key-value pairs to write (supports {{variable}} syntax)'),
    merge: z.boolean().default(true).describe('Whether to merge with existing data or replace'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    sessionData: z.record(z.unknown()).describe('Updated session data'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: false,
  defaultTimeout: 1000,
};

/**
 * SESSION_END Node
 * Ends the current session
 */
const sessionEndNode: NodeDefinition = {
  type: 'SESSION_END',
  name: 'End Session',
  category: 'state',
  description: 'Ends the current session (required for USSD workflows)',
  icon: 'x-circle',
  color: '#ef4444',
  inputHandles: [
    {
      id: 'default',
      label: 'Input',
      type: 'input',
      dataType: 'any',
    },
  ],
  outputHandles: [],
  configSchema: z.object({
    message: z.string().optional().describe('Final message to send (supports {{variable}} syntax)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    ended: z.boolean().describe('Whether session was ended'),
  }),
  requiresSession: true,
  endsSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: false,
  defaultTimeout: 5000,
};

/**
 * Register all state nodes
 */
export function registerStateNodes(): void {
  nodeRegistry.register(sessionReadNode);
  nodeRegistry.register(sessionWriteNode);
  nodeRegistry.register(sessionEndNode);
}
