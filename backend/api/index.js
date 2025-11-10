import dotenv from 'dotenv';
import app from '../src/app.js';

// Load environment variables
dotenv.config();

// Export the Express app as a serverless function for Vercel
// This is the entry point for all serverless function invocations on Vercel
export default app;

