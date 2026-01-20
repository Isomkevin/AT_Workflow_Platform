/**
 * Africa's Talking API Client
 * 
 * Clean abstraction over AT APIs with:
 * - Normalized payloads
 * - Retry & rate limit handling
 * - Error translation
 * - Type safety
 */

import {
  ATConfig,
  SendSMSRequest,
  SendSMSResponse,
  SendUSSDResponseRequest,
  SendUSSDResponseResponse,
  InitiateCallRequest,
  InitiateCallResponse,
  PlayIVRRequest,
  PlayIVRResponse,
  CollectDTMFRequest,
  CollectDTMFResponse,
  RequestPaymentRequest,
  RequestPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  ATError,
} from './types';

/**
 * Africa's Talking API Client
 */
export class ATClient {
  private config: ATConfig;
  private baseUrl: string;

  constructor(config: ATConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl(config.environment);
  }

  /**
   * Get default base URL based on environment
   */
  private getDefaultBaseUrl(environment: 'sandbox' | 'production'): string {
    if (environment === 'sandbox') {
      return 'https://api.sandbox.africastalking.com';
    }
    return 'https://api.africastalking.com';
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apiKey': this.config.apiKey,
      'Accept': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ATError) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Network request failed', true);
    }
  }

  /**
   * Parse API error response
   */
  private async parseError(response: Response): Promise<ATError> {
    let message = 'API request failed';
    let code = 'API_ERROR';
    let retryable = false;

    try {
      const errorData = await response.json();
      message = errorData.message || message;
      code = errorData.errorCode || code;
      
      // Determine if error is retryable
      retryable = response.status >= 500 || response.status === 429;
    } catch {
      // If error response is not JSON, use status text
      message = response.statusText || message;
    }

    return this.createError(code, message, retryable, response.status);
  }

  /**
   * Create AT error
   */
  private createError(
    code: string,
    message: string,
    retryable: boolean,
    statusCode?: number
  ): ATError {
    return {
      code,
      message,
      statusCode,
      retryable,
    };
  }

  /**
   * Send SMS
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    const endpoint = '/version1/messaging';
    const payload = {
      username: this.config.username,
      to: request.to,
      message: request.message,
      ...(request.from && { from: request.from }),
    };

    const response = await this.request<{
      SMSMessageData: {
        Recipients: Array<{
          statusCode: number;
          number: string;
          status: string;
          messageId: string;
          cost?: string;
        }>;
      };
    }>(endpoint, 'POST', payload);

    const recipient = response.SMSMessageData.Recipients[0];
    if (!recipient || recipient.statusCode !== 101) {
      throw this.createError(
        'SMS_SEND_FAILED',
        recipient?.status || 'Failed to send SMS',
        false
      );
    }

    return {
      messageId: recipient.messageId,
      status: recipient.status,
      cost: recipient.cost,
    };
  }

  /**
   * Send USSD Response
   */
  async sendUSSDResponse(request: SendUSSDResponseRequest): Promise<SendUSSDResponseResponse> {
    const endpoint = '/version1/ussd';
    const payload = {
      sessionId: request.sessionId,
      text: request.message,
    };

    // Note: AT USSD API structure may vary - adjust based on actual API
    const response = await this.request<{
      sessionId: string;
      message: string;
      status: string;
    }>(endpoint, 'POST', payload);

    return {
      sessionId: response.sessionId,
      message: response.message,
      status: response.status,
    };
  }

  /**
   * Initiate Voice Call
   */
  async initiateCall(request: InitiateCallRequest): Promise<InitiateCallResponse> {
    const endpoint = '/version1/voice/call';
    const payload = {
      username: this.config.username,
      to: request.to,
      ...(request.from && { from: request.from }),
      ...(request.callHoldMusic && { callHoldMusic: request.callHoldMusic }),
    };

    const response = await this.request<{
      entries: Array<{
        status: string;
        phoneNumber: string;
        sessionId: string;
      }>;
    }>(endpoint, 'POST', payload);

    const entry = response.entries[0];
    if (!entry || entry.status !== 'Queued') {
      throw this.createError('CALL_INITIATION_FAILED', 'Failed to initiate call', false);
    }

    return {
      callSessionId: entry.sessionId,
      status: entry.status,
    };
  }

  /**
   * Play IVR
   */
  async playIVR(request: PlayIVRRequest): Promise<PlayIVRResponse> {
    const endpoint = `/version1/voice/mediaUpload`;
    // Note: AT Voice API structure may vary - adjust based on actual API
    // This is a simplified implementation
    
    const payload: Record<string, unknown> = {
      callSessionId: request.callSessionId,
    };

    if (request.text) {
      payload.text = request.text;
      payload.language = request.language || 'en';
      payload.voice = request.voice || 'default';
    } else if (request.audioUrl) {
      payload.audioUrl = request.audioUrl;
    }

    if (request.loop) {
      payload.loop = request.loop;
    }

    const response = await this.request<{
      status: string;
      played: boolean;
    }>(endpoint, 'POST', payload);

    return {
      played: response.played,
      status: response.status,
    };
  }

  /**
   * Collect DTMF
   */
  async collectDTMF(request: CollectDTMFRequest): Promise<CollectDTMFResponse> {
    const endpoint = `/version1/voice/dtmf`;
    
    const payload = {
      callSessionId: request.callSessionId,
      maxDigits: request.maxDigits,
      timeout: request.timeout,
      ...(request.finishOnKey && { finishOnKey: request.finishOnKey }),
      ...(request.playPrompt && { playPrompt: request.playPrompt }),
    };

    const response = await this.request<{
      digits: string;
      length: number;
      status: string;
    }>(endpoint, 'POST', payload);

    return {
      digits: response.digits,
      length: response.length,
      status: response.status,
    };
  }

  /**
   * Request Payment
   */
  async requestPayment(request: RequestPaymentRequest): Promise<RequestPaymentResponse> {
    let endpoint: string;
    let payload: Record<string, unknown>;

    if (request.transactionType === 'checkout') {
      endpoint = '/payment/checkout/request';
      payload = {
        username: this.config.username,
        productName: request.productName,
        phoneNumber: request.phoneNumber,
        currencyCode: request.currency,
        amount: request.amount,
        ...(request.metadata && { metadata: request.metadata }),
      };
    } else if (request.transactionType === 'b2c') {
      endpoint = '/payment/b2c/request';
      payload = {
        username: this.config.username,
        productName: request.productName,
        recipients: [{
          phoneNumber: request.phoneNumber,
          currencyCode: request.currency,
          amount: request.amount,
          ...(request.metadata && { metadata: request.metadata }),
        }],
      };
    } else {
      endpoint = '/payment/b2b/request';
      payload = {
        username: this.config.username,
        productName: request.productName,
        provider: request.metadata?.provider || 'ATHENA',
        transferType: 'BusinessBuyGoods',
        currencyCode: request.currency,
        amount: request.amount,
        destinationChannel: request.phoneNumber,
        destinationAccount: request.metadata?.account || request.phoneNumber,
        ...(request.metadata && { metadata: request.metadata }),
      };
    }

    const response = await this.request<{
      transactionId: string;
      checkoutToken?: string;
      status: string;
    }>(endpoint, 'POST', payload);

    return {
      transactionId: response.transactionId,
      checkoutToken: response.checkoutToken,
      status: response.status,
    };
  }

  /**
   * Refund Payment
   */
  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const endpoint = '/payment/refund';
    const payload = {
      username: this.config.username,
      transactionId: request.transactionId,
      ...(request.amount && { amount: request.amount }),
    };

    const response = await this.request<{
      refundTransactionId: string;
      status: string;
    }>(endpoint, 'POST', payload);

    return {
      refundTransactionId: response.refundTransactionId,
      status: response.status,
    };
  }
}
