/**
 * Server Entry Point
 * 
 * Starts the Express API server
 */

import { startServer } from './api/server';

// Get AT config from environment variables (optional)
const atConfig = process.env.AT_USERNAME && process.env.AT_API_KEY ? {
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY,
  environment: (process.env.AT_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
} : undefined;

const port = parseInt(process.env.PORT || '3001', 10);

console.log('Starting Africa\'s Talking Workflow Platform...');
console.log(`Port: ${port}`);
console.log(`AT Config: ${atConfig ? 'Configured' : 'Not configured (workflows will run without AT integration)'}`);

startServer(port, atConfig).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
