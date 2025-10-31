import express from 'express';
import { stripeWebhook } from '../controllers/stripe.controller.js';

const router = express.Router();

// Use raw body for Stripe signature verification on this route only
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;


