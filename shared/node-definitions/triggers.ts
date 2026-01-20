/**
 * Trigger Node Definitions
 * 
 * Triggers initiate workflow execution
 */

import { z } from 'zod';
import { NodeDefinition, nodeRegistry, ValidationContext, ValidationResult } from './types';

/**
 * SMS_RECEIVED Trigger
 * Fires when an SMS is received
 */
const smsReceivedTrigger: NodeDefinition = {
  type: 'SMS_RECEIVED',
  name: 'SMS Received',
  category: 'trigger',
  description: 'Triggers when an SMS is received matching the filter criteria',
  icon: 'message-square',
  color: '#10b981',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'SMS Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    phoneNumber: z.string().optional().describe('Filter by sender phone number (optional)'),
    keyword: z.string().optional().describe('Filter by message keyword (optional)'),
    caseSensitive: z.boolean().default(false).describe('Case-sensitive keyword matching'),
  }),
  outputSchema: z.object({
    msisdn: z.string().describe('Sender phone number'),
    message: z.string().describe('SMS message content'),
    messageId: z.string().describe('AT message ID'),
    timestamp: z.string().describe('ISO timestamp of receipt'),
  }),
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
};

/**
 * USSD_SESSION_START Trigger
 * Fires when a USSD session starts
 */
const ussdSessionStartTrigger: NodeDefinition = {
  type: 'USSD_SESSION_START',
  name: 'USSD Session Start',
  category: 'trigger',
  description: 'Triggers when a new USSD session is initiated',
  icon: 'phone',
  color: '#3b82f6',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'Session Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    serviceCode: z.string().optional().describe('Filter by USSD service code (optional)'),
  }),
  outputSchema: z.object({
    sessionId: z.string().describe('USSD session ID'),
    msisdn: z.string().describe('User phone number'),
    serviceCode: z.string().describe('USSD service code'),
    networkCode: z.string().describe('Network operator code'),
    timestamp: z.string().describe('ISO timestamp of session start'),
  }),
  requiresSession: true,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
};

/**
 * INCOMING_CALL Trigger
 * Fires when a voice call is received
 */
const incomingCallTrigger: NodeDefinition = {
  type: 'INCOMING_CALL',
  name: 'Incoming Call',
  category: 'trigger',
  description: 'Triggers when an incoming voice call is received',
  icon: 'phone-call',
  color: '#8b5cf6',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'Call Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    phoneNumber: z.string().optional().describe('Filter by caller phone number (optional)'),
  }),
  outputSchema: z.object({
    callSessionId: z.string().describe('Call session ID'),
    callerNumber: z.string().describe('Caller phone number'),
    calledNumber: z.string().describe('Called phone number'),
    timestamp: z.string().describe('ISO timestamp of call'),
  }),
  requiresSession: true,
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
};

/**
 * PAYMENT_CALLBACK Trigger
 * Fires when a payment callback is received
 */
const paymentCallbackTrigger: NodeDefinition = {
  type: 'PAYMENT_CALLBACK',
  name: 'Payment Callback',
  category: 'trigger',
  description: 'Triggers when a payment transaction callback is received',
  icon: 'credit-card',
  color: '#f59e0b',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'Payment Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    transactionType: z.enum(['checkout', 'b2c', 'b2b']).optional().describe('Filter by transaction type'),
    status: z.enum(['Success', 'Failed', 'Pending']).optional().describe('Filter by transaction status'),
  }),
  outputSchema: z.object({
    transactionId: z.string().describe('Transaction ID'),
    status: z.string().describe('Transaction status'),
    amount: z.number().describe('Transaction amount'),
    currency: z.string().describe('Currency code'),
    msisdn: z.string().optional().describe('Customer phone number (if applicable)'),
    metadata: z.record(z.unknown()).optional().describe('Additional transaction metadata'),
    timestamp: z.string().describe('ISO timestamp of callback'),
  }),
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
};

/**
 * SCHEDULED Trigger
 * Fires on a schedule (cron-like)
 */
const scheduledTrigger: NodeDefinition = {
  type: 'SCHEDULED',
  name: 'Scheduled',
  category: 'trigger',
  description: 'Triggers on a schedule using cron expression',
  icon: 'clock',
  color: '#6366f1',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'Schedule Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    cronExpression: z.string().describe('Cron expression (e.g., "0 9 * * *" for daily at 9 AM)'),
    timezone: z.string().default('UTC').describe('Timezone for schedule'),
  }),
  outputSchema: z.object({
    scheduledAt: z.string().describe('ISO timestamp of scheduled execution'),
    cronExpression: z.string().describe('Cron expression used'),
  }),
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
  validate: (config: unknown): ValidationResult => {
    const parsed = z.object({ cronExpression: z.string() }).safeParse(config);
    if (!parsed.success) {
      return { valid: false, errors: [{ field: 'cronExpression', message: 'Invalid cron expression' }] };
    }

    // Basic cron validation (5 or 6 fields)
    const parts = parsed.data.cronExpression.trim().split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) {
      return {
        valid: false,
        errors: [{ field: 'cronExpression', message: 'Cron expression must have 5 or 6 fields' }],
      };
    }

    return { valid: true, errors: [] };
  },
};

/**
 * HTTP_WEBHOOK Trigger
 * Fires when an HTTP webhook is called
 */
const httpWebhookTrigger: NodeDefinition = {
  type: 'HTTP_WEBHOOK',
  name: 'HTTP Webhook',
  category: 'trigger',
  description: 'Triggers when an HTTP webhook endpoint is called',
  icon: 'webhook',
  color: '#ec4899',
  inputHandles: [],
  outputHandles: [
    {
      id: 'default',
      label: 'Webhook Data',
      type: 'output',
      dataType: 'object',
    },
  ],
  configSchema: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST').describe('HTTP method'),
    path: z.string().regex(/^\/[a-zA-Z0-9\/_-]*$/).describe('Webhook path (e.g., /webhook/sms)'),
    requireAuth: z.boolean().default(false).describe('Require authentication'),
    authToken: z.string().optional().describe('Auth token (if requireAuth is true)'),
  }),
  outputSchema: z.object({
    method: z.string().describe('HTTP method'),
    path: z.string().describe('Request path'),
    headers: z.record(z.string()).describe('Request headers'),
    query: z.record(z.string()).describe('Query parameters'),
    body: z.unknown().describe('Request body'),
    timestamp: z.string().describe('ISO timestamp of request'),
  }),
  allowMultipleOutputs: true,
  defaultTimeout: 30000,
};

/**
 * Register all trigger nodes
 */
export function registerTriggerNodes(): void {
  nodeRegistry.register(smsReceivedTrigger);
  nodeRegistry.register(ussdSessionStartTrigger);
  nodeRegistry.register(incomingCallTrigger);
  nodeRegistry.register(paymentCallbackTrigger);
  nodeRegistry.register(scheduledTrigger);
  nodeRegistry.register(httpWebhookTrigger);
}
