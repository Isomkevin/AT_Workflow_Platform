/**
 * Node Executors for Africa's Talking Actions
 * 
 * Implements INodeExecutor for each AT action node type
 */

import { ExecutionNode } from '../../compiler/types';
import { INodeExecutor, ExecutionStep } from '../../execution-engine/types';
import {
  ExecutionContext,
  NodeExecutionResult,
  NodeError,
} from '../../shared/workflow-spec/types';
import { ATClient } from './client';
import { renderTemplate } from '../../execution-engine/template-renderer';

/**
 * Base executor with common functionality
 */
abstract class BaseATExecutor implements INodeExecutor {
  protected client: ATClient;

  constructor(client: ATClient) {
    this.client = client;
  }

  abstract execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult>;

  /**
   * Render template string with variables
   */
  protected renderTemplate(template: string, context: ExecutionContext, input: Record<string, unknown>): string {
    return renderTemplate(template, { ...context.variables, ...input });
  }

  /**
   * Create error result
   */
  protected createErrorResult(
    nodeId: string,
    error: NodeError,
    durationMs: number,
    attempt: number
  ): NodeExecutionResult {
    return {
      nodeId,
      status: 'error',
      error,
      durationMs,
      executedAt: new Date().toISOString(),
      attempt,
    };
  }

  /**
   * Create success result
   */
  protected createSuccessResult(
    nodeId: string,
    output: Record<string, unknown>,
    durationMs: number,
    attempt: number
  ): NodeExecutionResult {
    return {
      nodeId,
      status: 'success',
      output,
      durationMs,
      executedAt: new Date().toISOString(),
      attempt,
    };
  }
}

/**
 * Send SMS Executor
 */
export class SendSMSExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as { to: string; message: string; from?: string };

    try {
      const to = this.renderTemplate(config.to, context, input);
      const message = this.renderTemplate(config.message, context, input);
      const from = config.from ? this.renderTemplate(config.from, context, input) : undefined;

      const response = await this.client.sendSMS({ to, message, from });

      return this.createSuccessResult(
        node.id,
        {
          messageId: response.messageId,
          status: response.status,
          cost: response.cost,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'SMS_SEND_ERROR',
          message: atError.message || 'Failed to send SMS',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Send USSD Response Executor
 */
export class SendUSSDResponseExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as { message: string; expectInput: boolean };

    if (!context.session) {
      return this.createErrorResult(
        node.id,
        {
          code: 'SESSION_REQUIRED',
          message: 'USSD response requires an active session',
          type: 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }

    try {
      const message = this.renderTemplate(config.message, context, input);
      const sessionId = context.session.sessionId;

      const response = await this.client.sendUSSDResponse({
        sessionId,
        message,
        expectInput: config.expectInput,
      });

      return this.createSuccessResult(
        node.id,
        {
          sessionId: response.sessionId,
          message: response.message,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'USSD_RESPONSE_ERROR',
          message: atError.message || 'Failed to send USSD response',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Initiate Call Executor
 */
export class InitiateCallExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as { to: string; from?: string; callHoldMusic?: string };

    try {
      const to = this.renderTemplate(config.to, context, input);
      const from = config.from ? this.renderTemplate(config.from, context, input) : undefined;
      const callHoldMusic = config.callHoldMusic
        ? this.renderTemplate(config.callHoldMusic, context, input)
        : undefined;

      const response = await this.client.initiateCall({ to, from, callHoldMusic });

      return this.createSuccessResult(
        node.id,
        {
          callSessionId: response.callSessionId,
          status: response.status,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'CALL_INITIATION_ERROR',
          message: atError.message || 'Failed to initiate call',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Play IVR Executor
 */
export class PlayIVRExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as {
      text?: string;
      audioUrl?: string;
      language?: string;
      voice?: string;
      loop?: number;
    };

    if (!context.session || context.session.type !== 'voice') {
      return this.createErrorResult(
        node.id,
        {
          code: 'VOICE_SESSION_REQUIRED',
          message: 'Play IVR requires an active voice session',
          type: 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }

    try {
      const callSessionId = context.session.sessionId;
      const text = config.text ? this.renderTemplate(config.text, context, input) : undefined;
      const audioUrl = config.audioUrl ? this.renderTemplate(config.audioUrl, context, input) : undefined;

      const response = await this.client.playIVR({
        callSessionId,
        text,
        audioUrl,
        language: config.language,
        voice: config.voice,
        loop: config.loop,
      });

      return this.createSuccessResult(
        node.id,
        {
          played: response.played,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'IVR_PLAY_ERROR',
          message: atError.message || 'Failed to play IVR',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Collect DTMF Executor
 */
export class CollectDTMFExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as {
      maxDigits: number;
      timeout: number;
      finishOnKey?: string;
      playPrompt?: string;
    };

    if (!context.session || context.session.type !== 'voice') {
      return this.createErrorResult(
        node.id,
        {
          code: 'VOICE_SESSION_REQUIRED',
          message: 'Collect DTMF requires an active voice session',
          type: 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }

    try {
      const callSessionId = context.session.sessionId;
      const playPrompt = config.playPrompt
        ? this.renderTemplate(config.playPrompt, context, input)
        : undefined;

      const response = await this.client.collectDTMF({
        callSessionId,
        maxDigits: config.maxDigits,
        timeout: config.timeout,
        finishOnKey: config.finishOnKey,
        playPrompt,
      });

      return this.createSuccessResult(
        node.id,
        {
          digits: response.digits,
          length: response.length,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'DTMF_COLLECTION_ERROR',
          message: atError.message || 'Failed to collect DTMF',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Request Payment Executor
 */
export class RequestPaymentExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as {
      transactionType: 'checkout' | 'b2c' | 'b2b';
      amount: string;
      currency: string;
      phoneNumber: string;
      productName: string;
      metadata?: Record<string, string>;
    };

    try {
      const amount = this.renderTemplate(config.amount, context, input);
      const phoneNumber = this.renderTemplate(config.phoneNumber, context, input);
      const productName = this.renderTemplate(config.productName, context, input);

      const response = await this.client.requestPayment({
        transactionType: config.transactionType,
        amount,
        currency: config.currency,
        phoneNumber,
        productName,
        metadata: config.metadata,
      });

      return this.createSuccessResult(
        node.id,
        {
          transactionId: response.transactionId,
          checkoutToken: response.checkoutToken,
          status: response.status,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'PAYMENT_REQUEST_ERROR',
          message: atError.message || 'Failed to request payment',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}

/**
 * Refund Payment Executor
 */
export class RefundPaymentExecutor extends BaseATExecutor {
  async execute(
    node: ExecutionNode,
    context: ExecutionContext,
    input: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const config = node.config as { transactionId: string; amount?: string };

    try {
      const transactionId = this.renderTemplate(config.transactionId, context, input);
      const amount = config.amount ? this.renderTemplate(config.amount, context, input) : undefined;

      const response = await this.client.refundPayment({
        transactionId,
        amount,
      });

      return this.createSuccessResult(
        node.id,
        {
          refundTransactionId: response.refundTransactionId,
          status: response.status,
        },
        Date.now() - startTime,
        0
      );
    } catch (error: unknown) {
      const atError = error as { code: string; message: string; retryable: boolean };
      return this.createErrorResult(
        node.id,
        {
          code: atError.code || 'PAYMENT_REFUND_ERROR',
          message: atError.message || 'Failed to refund payment',
          type: atError.retryable ? 'transient' : 'permanent',
        },
        Date.now() - startTime,
        0
      );
    }
  }
}
