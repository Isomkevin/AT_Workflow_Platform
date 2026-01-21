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
    encoding: z.enum(['GSM7', 'UCS2', 'auto']).default('auto').describe('Message encoding'),
    deliveryReport: z.boolean().default(false).describe('Request delivery report'),
    deliveryReportUrl: z.string().url().optional().describe('Custom delivery report webhook URL'),
    enqueue: z.boolean().default(false).describe('Enqueue message if rate limited'),
    bulkSMSMode: z.number().int().min(0).max(1).default(0).describe('Bulk SMS mode (0=normal, 1=bulk)'),
    keyword: z.string().optional().describe('Keyword for premium SMS'),
    linkId: z.string().optional().describe('Link ID for premium SMS'),
    retryOnFailure: z.boolean().default(true).describe('Retry on delivery failure'),
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
    menuType: z.enum(['text', 'menu', 'input']).default('text').describe('Type of USSD response'),
    menuItems: z.array(z.object({
      option: z.string().describe('Menu option key (e.g., "1")'),
      text: z.string().describe('Menu option text'),
    })).optional().describe('Menu items (for menu type)'),
    pagination: z.object({
      enabled: z.boolean().default(false).describe('Enable pagination'),
      itemsPerPage: z.number().int().min(1).max(10).default(5).describe('Items per page'),
      nextKey: z.string().default('99').describe('Key to go to next page'),
      prevKey: z.string().default('98').describe('Key to go to previous page'),
    }).optional().describe('Pagination configuration'),
    sessionTimeout: z.number().int().min(10).max(300).default(60).describe('Session timeout in seconds'),
    autoEndSession: z.boolean().default(false).describe('Automatically end session after response'),
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
    callHoldMusic: z.string().url().optional().describe('Hold music URL (optional)'),
    maxCallDuration: z.number().int().min(10).max(3600).default(300).describe('Maximum call duration in seconds'),
    recordCall: z.boolean().default(false).describe('Record the call'),
    recordingUrl: z.string().url().optional().describe('Recording webhook URL'),
    enableDtmf: z.boolean().default(true).describe('Enable DTMF input collection'),
    ringbackTone: z.string().url().optional().describe('Custom ringback tone URL'),
    timeout: z.number().int().min(5).max(60).default(30).describe('Call timeout in seconds'),
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
    text: z.string().optional().describe('Text to speech (TTS) message (supports {{variable}} syntax)'),
    audioUrl: z.string().url().optional().describe('Audio file URL to play'),
    language: z.enum(['en', 'sw', 'fr', 'ar', 'am', 'rw', 'so', 'zu', 'xh', 'af']).default('en').describe('TTS language code'),
    voice: z.enum(['default', 'male', 'female', 'child']).default('default').describe('TTS voice type'),
    loop: z.number().int().min(1).max(10).default(1).describe('Number of times to loop'),
    timeout: z.number().int().min(1).max(300).default(30).describe('Playback timeout in seconds'),
    interruptOnDtmf: z.boolean().default(false).describe('Interrupt playback on DTMF input'),
    bargeIn: z.boolean().default(false).describe('Allow barge-in (interrupt with voice)'),
    audioFormat: z.enum(['mp3', 'wav', 'gsm']).default('mp3').describe('Audio file format'),
    sampleRate: z.number().int().optional().describe('Audio sample rate (Hz)'),
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
    minDigits: z.number().int().min(1).max(20).optional().describe('Minimum number of digits required'),
    timeout: z.number().int().min(1).max(60).default(10).describe('Timeout in seconds'),
    finishOnKey: z.string().optional().describe('Key that finishes input (e.g., "#")'),
    playPrompt: z.string().optional().describe('Prompt to play before collecting (TTS, supports {{variable}} syntax)'),
    playPromptUrl: z.string().url().optional().describe('Audio file URL for prompt'),
    invalidKeyTone: z.boolean().default(true).describe('Play tone on invalid key press'),
    validKeys: z.string().optional().describe('Valid keys (e.g., "0123456789*#")'),
    invalidKeyMessage: z.string().optional().describe('Message to play on invalid key'),
    retryOnInvalid: z.boolean().default(true).describe('Retry collection on invalid input'),
    maxRetries: z.number().int().min(0).max(5).default(3).describe('Maximum retry attempts'),
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
    currency: z.enum(['KES', 'UGX', 'TZS', 'RWF', 'ETB', 'ZAR', 'NGN', 'GHS', 'XOF', 'XAF']).default('KES').describe('Currency code'),
    phoneNumber: z.string().describe('Customer phone number (supports {{variable}} syntax)'),
    productName: z.string().describe('Product/service name (supports {{variable}} syntax)'),
    metadata: z.record(z.string()).optional().describe('Additional metadata (supports {{variable}} syntax)'),
    callbackUrl: z.string().url().optional().describe('Custom callback URL for payment status'),
    providerChannel: z.string().optional().describe('Payment provider channel'),
    provider: z.enum(['AT', 'M-Pesa', 'Airtel', 'MTN', 'Orange']).optional().describe('Payment provider'),
    narration: z.string().optional().describe('Transaction narration (supports {{variable}} syntax)'),
    validityPeriod: z.number().int().min(1).max(1440).optional().describe('Validity period in minutes (checkout only)'),
    checkoutToken: z.string().optional().describe('Checkout token (if reusing checkout)'),
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
    amount: z.string().optional().describe('Refund amount (optional, full refund if not provided, supports {{variable}} syntax)'),
    currency: z.enum(['KES', 'UGX', 'TZS', 'RWF', 'ETB', 'ZAR', 'NGN', 'GHS', 'XOF', 'XAF']).optional().describe('Currency code (must match original transaction)'),
    reason: z.string().optional().describe('Refund reason (supports {{variable}} syntax)'),
    callbackUrl: z.string().url().optional().describe('Custom callback URL for refund status'),
    metadata: z.record(z.string()).optional().describe('Additional metadata'),
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
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).default('GET').describe('HTTP method'),
    url: z.string().url().describe('Request URL (supports {{variable}} syntax)'),
    headers: z.record(z.string()).optional().describe('HTTP headers (supports {{variable}} syntax in values)'),
    body: z.string().optional().describe('Request body (JSON string, supports {{variable}} syntax)'),
    bodyType: z.enum(['json', 'form', 'raw', 'xml']).default('json').describe('Request body type'),
    auth: z.object({
      type: z.enum(['none', 'basic', 'bearer', 'apikey', 'oauth2']).default('none').describe('Authentication type'),
      username: z.string().optional().describe('Basic auth username or API key name'),
      password: z.string().optional().describe('Basic auth password or API key value'),
      token: z.string().optional().describe('Bearer token or OAuth2 access token'),
      headerName: z.string().optional().describe('Custom header name (for apikey type)'),
      oauth2Url: z.string().url().optional().describe('OAuth2 token URL'),
      oauth2ClientId: z.string().optional().describe('OAuth2 client ID'),
      oauth2ClientSecret: z.string().optional().describe('OAuth2 client secret'),
    }).default({ type: 'none' }).describe('Authentication configuration'),
    timeout: z.number().int().min(100).max(300000).default(30000).describe('Request timeout in milliseconds'),
    retry: z.object({
      attempts: z.number().int().min(0).max(5).default(0).describe('Number of retry attempts'),
      backoffMs: z.number().int().min(100).max(10000).default(1000).describe('Retry backoff in milliseconds'),
      backoffMultiplier: z.number().positive().default(2).describe('Exponential backoff multiplier'),
      retryableStatusCodes: z.array(z.number().int()).default([500, 502, 503, 504]).describe('HTTP status codes to retry on'),
    }).optional().describe('Retry configuration'),
    followRedirects: z.boolean().default(true).describe('Follow HTTP redirects'),
    maxRedirects: z.number().int().min(0).max(10).default(5).describe('Maximum number of redirects'),
    validateSSL: z.boolean().default(true).describe('Validate SSL certificates'),
    parseResponse: z.boolean().default(true).describe('Parse JSON response automatically'),
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
