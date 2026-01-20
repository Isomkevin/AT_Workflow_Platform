/**
 * Session Manager
 * 
 * Manages session state for USSD, Voice, SMS, and Payment workflows.
 * Uses Redis for fast, distributed session storage.
 */

import { SessionState } from '../../shared/workflow-spec/types';

/**
 * Session Manager Interface
 */
export interface ISessionManager {
  /**
   * Create a new session
   */
  createSession(session: Omit<SessionState, 'createdAt' | 'lastActivityAt'>): Promise<SessionState>;

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Promise<SessionState | null>;

  /**
   * Update session data
   */
  updateSession(sessionId: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Update session activity timestamp
   */
  touchSession(sessionId: string): Promise<void>;

  /**
   * End a session
   */
  endSession(sessionId: string): Promise<void>;

  /**
   * Get session by MSISDN and type (for finding active sessions)
   */
  getActiveSessionByMsisdn(msisdn: string, type: SessionState['type']): Promise<SessionState | null>;

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): Promise<number>;
}

/**
 * Redis-based Session Manager
 * 
 * Note: This is a simplified implementation. In production, use a proper Redis client
 * like ioredis or node-redis with connection pooling, error handling, etc.
 */
export class RedisSessionManager implements ISessionManager {
  private redis: Map<string, SessionState>; // Simplified - replace with actual Redis client
  private defaultTtl: number;

  constructor(defaultTtlSeconds: number = 3600) {
    this.redis = new Map(); // In production, use actual Redis client
    this.defaultTtl = defaultTtlSeconds * 1000; // Convert to milliseconds
  }

  async createSession(
    session: Omit<SessionState, 'createdAt' | 'lastActivityAt'>
  ): Promise<SessionState> {
    const now = new Date().toISOString();
    const expiresAt = session.expiresAt || new Date(Date.now() + this.defaultTtl).toISOString();

    const fullSession: SessionState = {
      ...session,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
      isActive: true,
    };

    // Store in Redis with TTL
    this.redis.set(`session:${session.sessionId}`, fullSession);
    
    // Also index by MSISDN + type for quick lookup
    if (session.msisdn) {
      this.redis.set(`session:msisdn:${session.msisdn}:${session.type}`, fullSession);
    }

    return fullSession;
  }

  async getSession(sessionId: string): Promise<SessionState | null> {
    const session = this.redis.get(`session:${sessionId}`);
    
    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      await this.endSession(sessionId);
      return null;
    }

    return session;
  }

  async updateSession(sessionId: string, data: Record<string, unknown>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.data = { ...session.data, ...data };
    session.lastActivityAt = new Date().toISOString();

    this.redis.set(`session:${sessionId}`, session);
    
    // Update indexed session
    if (session.msisdn) {
      this.redis.set(`session:msisdn:${session.msisdn}:${session.type}`, session);
    }
  }

  async touchSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.lastActivityAt = new Date().toISOString();
    this.redis.set(`session:${sessionId}`, session);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.isActive = false;
    session.lastActivityAt = new Date().toISOString();

    this.redis.set(`session:${sessionId}`, session);
    
    // Remove from active index
    if (session.msisdn) {
      this.redis.delete(`session:msisdn:${session.msisdn}:${session.type}`);
    }
  }

  async getActiveSessionByMsisdn(
    msisdn: string,
    type: SessionState['type']
  ): Promise<SessionState | null> {
    const session = this.redis.get(`session:msisdn:${msisdn}:${type}`);
    
    if (!session || !session.isActive) {
      return null;
    }

    // Check if expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      await this.endSession(session.sessionId);
      return null;
    }

    return session;
  }

  async cleanupExpiredSessions(): Promise<number> {
    let cleaned = 0;
    const now = new Date();

    for (const [key, session] of this.redis.entries()) {
      if (key.startsWith('session:') && !key.includes('msisdn:')) {
        if (session.expiresAt && new Date(session.expiresAt) < now) {
          await this.endSession(session.sessionId);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}
