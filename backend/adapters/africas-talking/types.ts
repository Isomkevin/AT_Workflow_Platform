/**
 * Africa's Talking Adapter Types
 * 
 * Clean abstraction over Africa's Talking APIs
 */

/**
 * AT Configuration
 */
export interface ATConfig {
  /** API username */
  username: string;
  
  /** API key */
  apiKey: string;
  
  /** Environment (sandbox or production) */
  environment: 'sandbox' | 'production';
  
  /** Base URL (optional, defaults based on environment) */
  baseUrl?: string;
}

/**
 * SMS Send Request
 */
export interface SendSMSRequest {
  to: string;
  message: string;
  from?: string;
}

/**
 * SMS Send Response
 */
export interface SendSMSResponse {
  messageId: string;
  status: string;
  cost?: string;
}

/**
 * USSD Response Request
 */
export interface SendUSSDResponseRequest {
  sessionId: string;
  message: string;
  expectInput: boolean;
}

/**
 * USSD Response Response
 */
export interface SendUSSDResponseResponse {
  sessionId: string;
  message: string;
  status: string;
}

/**
 * Voice Call Request
 */
export interface InitiateCallRequest {
  to: string;
  from?: string;
  callHoldMusic?: string;
}

/**
 * Voice Call Response
 */
export interface InitiateCallResponse {
  callSessionId: string;
  status: string;
}

/**
 * IVR Play Request
 */
export interface PlayIVRRequest {
  callSessionId: string;
  text?: string;
  audioUrl?: string;
  language?: string;
  voice?: string;
  loop?: number;
}

/**
 * IVR Play Response
 */
export interface PlayIVRResponse {
  played: boolean;
  status: string;
}

/**
 * Collect DTMF Request
 */
export interface CollectDTMFRequest {
  callSessionId: string;
  maxDigits: number;
  timeout: number;
  finishOnKey?: string;
  playPrompt?: string;
}

/**
 * Collect DTMF Response
 */
export interface CollectDTMFResponse {
  digits: string;
  length: number;
  status: string;
}

/**
 * Payment Request
 */
export interface RequestPaymentRequest {
  transactionType: 'checkout' | 'b2c' | 'b2b';
  amount: string;
  currency: string;
  phoneNumber: string;
  productName: string;
  metadata?: Record<string, string>;
}

/**
 * Payment Response
 */
export interface RequestPaymentResponse {
  transactionId: string;
  checkoutToken?: string;
  status: string;
}

/**
 * Refund Request
 */
export interface RefundPaymentRequest {
  transactionId: string;
  amount?: string;
}

/**
 * Refund Response
 */
export interface RefundPaymentResponse {
  refundTransactionId: string;
  status: string;
}

/**
 * AT API Error
 */
export class ATError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;

  constructor(code: string, message: string, retryable: boolean, statusCode?: number) {
    super(message);
    this.name = 'ATError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
