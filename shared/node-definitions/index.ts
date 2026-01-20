/**
 * Node Definitions - Public API
 * 
 * Registers all node definitions and provides access to the registry
 */

import { nodeRegistry } from './types';
import { registerTriggerNodes } from './triggers';
import { registerActionNodes } from './actions';
import { registerLogicNodes } from './logic';
import { registerStateNodes } from './state';

/**
 * Initialize and register all node definitions
 * Call this once at application startup
 */
export function initializeNodeDefinitions(): void {
  registerTriggerNodes();
  registerActionNodes();
  registerLogicNodes();
  registerStateNodes();
}

/**
 * Re-export types and registry
 */
export * from './types';
export { nodeRegistry };
