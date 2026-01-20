/**
 * Action Node Definitions
 * 
 * Actions perform operations (send SMS, make calls, etc.)
 */

import { z } from 'zod';
import { NodeDefinition, nodeRegistry, ValidationContext, ValidationResult } from './types';

/**
 * SEND_SMS Action
 * Sends an SMS message
 */
const sendSmsAction: NodeDefinition = {
  type: 'SEND_SMS',
  name: 'Send SMS',
  category: 'action',
  description: 'Sends an SMS message via Africa\'s Talking',
  icon: 'send',
  color: '#10b981',
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
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    to: z.string().describe('Recipient phone number (supports {{variable}} syntax)'),
    message: z.string().min(1).describe('SMS message content (supports {{variable}} syntax)'),
    from: z.string().optional().describe('Sender ID (optional, uses default if not provided)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    messageId: z.string().describe('AT message ID'),
    status: z.string().describe('Message status'),
    cost: z.string().optional().describe('Message cost'),
  }),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  defaultRetry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    retryableErrors: ['RATE_LIMIT', 'NETWORK_ERROR'],
  },
};

/**
 * SEND_USSD_RESPONSE Action
 * Sends a USSD response (menu or message)
 */
const sendUssdResponseAction: NodeDefinition = {
  type: 'SEND_USSD_RESPONSE',
  name: 'Send USSD Response',
  category: 'action',
  description: 'Sends a USSD response to the user',
  icon: 'phone',
  color: '#3b82f6',
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
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    message: z.string().min(1).describe('USSD message/menu (supports {{variable}} syntax)'),
    expectInput: z.boolean().default(false).describe('Whether to expect user input after this response'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    sessionId: z.string().describe('USSD session ID'),
    message: z.string().describe('Message sent'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 10000,
};

/**
 * INITIATE_CALL Action
 * Initiates an outbound voice call
 */
const initiateCallAction: NodeDefinition = {
  type: 'INITIATE_CALL',
  name: 'Initiate Call',
  category: 'action',
  description: 'Initiates an outbound voice call',
  icon: 'phone-call',
  color: '#8b5cf6',
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
      label: 'Call Connected',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'no_answer',
      label: 'No Answer',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    to: z.string().describe('Recipient phone number (supports {{variable}} syntax)'),
    from: z.string().optional().describe('Caller ID (optional)'),
    callHoldMusic: z.string().optional().describe('Hold music URL (optional)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    callSessionId: z.string().describe('Call session ID'),
    status: z.string().describe('Call status'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 60000,
};

/**
 * PLAY_IVR Action
 * Plays an IVR message or menu
 */
const playIvrAction: NodeDefinition = {
  type: 'PLAY_IVR',
  name: 'Play IVR',
  category: 'action',
  description: 'Plays an IVR message or audio file',
  icon: 'volume-2',
  color: '#8b5cf6',
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
      label: 'Played',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    text: z.string().optional().describe('Text to speech (TTS) message'),
    audioUrl: z.string().url().optional().describe('Audio file URL to play'),
    language: z.string().default('en').describe('TTS language code'),
    voice: z.string().default('default').describe('TTS voice'),
    loop: z.number().int().min(1).max(3).default(1).describe('Number of times to loop'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    played: z.boolean().describe('Whether audio was played successfully'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  validate: (config: unknown): ValidationResult => {
    const parsed = z.object({
      text: z.string().optional(),
      audioUrl: z.string().url().optional(),
    }).safeParse(config);
    
    if (!parsed.success) {
      return { valid: false, errors: [{ field: 'config', message: 'Invalid configuration' }] };
    }

    if (!parsed.data.text && !parsed.data.audioUrl) {
      return {
        valid: false,
        errors: [{ field: 'text/audioUrl', message: 'Either text or audioUrl must be provided' }],
      };
    }

    return { valid: true, errors: [] };
  },
};

/**
 * COLLECT_DTMF Action
 * Collects DTMF (keypad) input from user
 */
const collectDtmfAction: NodeDefinition = {
  type: 'COLLECT_DTMF',
  name: 'Collect DTMF',
  category: 'action',
  description: 'Collects DTMF (keypad) input from the user during a call',
  icon: 'keypad',
  color: '#8b5cf6',
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
      label: 'Input Received',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'timeout',
      label: 'Timeout',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    maxDigits: z.number().int().min(1).max(20).default(10).describe('Maximum number of digits to collect'),
    timeout: z.number().int().min(1).max(60).default(10).describe('Timeout in seconds'),
    finishOnKey: z.string().optional().describe('Key that finishes input (e.g., "#")'),
    playPrompt: z.string().optional().describe('Prompt to play before collecting (TTS)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    digits: z.string().describe('Collected digits'),
    length: z.number().describe('Number of digits collected'),
  }),
  requiresSession: true,
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 60000,
};

/**
 * REQUEST_PAYMENT Action
 * Initiates a payment request
 */
const requestPaymentAction: NodeDefinition = {
  type: 'REQUEST_PAYMENT',
  name: 'Request Payment',
  category: 'action',
  description: 'Initiates a payment request (checkout, B2C, B2B)',
  icon: 'credit-card',
  color: '#f59e0b',
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
      label: 'Payment Initiated',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    transactionType: z.enum(['checkout', 'b2c', 'b2b']).describe('Payment transaction type'),
    amount: z.string().describe('Amount (supports {{variable}} syntax)'),
    currency: z.string().default('KES').describe('Currency code'),
    phoneNumber: z.string().describe('Customer phone number (supports {{variable}} syntax)'),
    productName: z.string().describe('Product/service name'),
    metadata: z.record(z.string()).optional().describe('Additional metadata'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    transactionId: z.string().describe('Transaction ID'),
    checkoutToken: z.string().optional().describe('Checkout token (for checkout type)'),
    status: z.string().describe('Initial transaction status'),
  }),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  defaultRetry: {
    maxAttempts: 2,
    initialDelayMs: 1000,
    retryableErrors: ['NETWORK_ERROR'],
  },
};

/**
 * REFUND_PAYMENT Action
 * Refunds a payment transaction
 */
const refundPaymentAction: NodeDefinition = {
  type: 'REFUND_PAYMENT',
  name: 'Refund Payment',
  category: 'action',
  description: 'Refunds a previously completed payment transaction',
  icon: 'undo',
  color: '#f59e0b',
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
      label: 'Refund Initiated',
      type: 'output',
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    transactionId: z.string().describe('Original transaction ID (supports {{variable}} syntax)'),
    amount: z.string().optional().describe('Refund amount (optional, full refund if not provided)'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    refundTransactionId: z.string().describe('Refund transaction ID'),
    status: z.string().describe('Refund status'),
  }),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  defaultRetry: {
    maxAttempts: 2,
    initialDelayMs: 1000,
    retryableErrors: ['NETWORK_ERROR'],
  },
};

/**
 * HTTP_REQUEST Action
 * Makes an HTTP request to an external API
 */
const httpRequestAction: NodeDefinition = {
  type: 'HTTP_REQUEST',
  name: 'HTTP Request',
  category: 'action',
  description: 'Makes an HTTP request to an external API',
  icon: 'globe',
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
      dataType: 'object',
    },
    {
      id: 'error',
      label: 'Error',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    url: z.string().url().describe('Request URL (supports {{variable}} syntax)'),
    headers: z.record(z.string()).optional().describe('HTTP headers'),
    body: z.string().optional().describe('Request body (JSON string, supports {{variable}} syntax)'),
    timeout: z.number().int().positive().default(30000).describe('Request timeout in milliseconds'),
  }),
  inputSchema: z.object({}).passthrough(),
  outputSchema: z.object({
    statusCode: z.number().describe('HTTP status code'),
    headers: z.record(z.string()).describe('Response headers'),
    body: z.unknown().describe('Response body'),
  }),
  allowMultipleInputs: false,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  defaultRetry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', '5XX'],
  },
};

/**
 * Register all action nodes
 */
export function registerActionNodes(): void {
  nodeRegistry.register(sendSmsAction);
  nodeRegistry.register(sendUssdResponseAction);
  nodeRegistry.register(initiateCallAction);
  nodeRegistry.register(playIvrAction);
  nodeRegistry.register(collectDtmfAction);
  nodeRegistry.register(requestPaymentAction);
  nodeRegistry.register(refundPaymentAction);
  nodeRegistry.register(httpRequestAction);
}
