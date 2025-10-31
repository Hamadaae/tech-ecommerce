import Stripe from "stripe";
import Order from "../models/Order.js";
import { adjustStock } from "../utils/helpers.js";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object; // as Stripe.Checkout.Session
      const sessionId = session.id;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          if (!order.stockReserved) {
            try {
              await adjustStock(order.orderItems, false);
              order.stockReserved = true;
            } catch (stockErr) {
              console.error("Stock adjustment error (webhook)", stockErr);
            }
          }

          order.isPaid = true;
          order.paymentStatus = "paid";
          order.paidAt = new Date();
          order.stripeCheckoutSessionId = sessionId;

          // Attempt to capture receipt/charge if payment_intent is present
          if (session.payment_intent) {
            try {
              const pi = await stripe.paymentIntents.retrieve(
                typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id,
                { expand: ["charges"] }
              );
              if (pi?.charges?.data?.length > 0) {
                const charge = pi.charges.data[0];
                order.stripeChargeId = charge.id || order.stripeChargeId;
                order.stripeReceiptUrl = charge.receipt_url || order.stripeReceiptUrl;
              }
            } catch (e) {
              console.warn("Unable to expand payment_intent from session", e?.message || e);
            }
          }

          await order.save();
        }
      }
    }

    // Other event types can be handled here

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    res.status(500).json({ received: false });
  }
}


