import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function createPaymentIntent(order, otps = {}) {
  try{
    if (!order || !order.totalPrice) {
    throw new Error("Invalid order data for payment");
  }

  const total = Number(order.totalPrice || 0)
  if(Number.isNaN(total) || total <= 0){
      throw new Error("Invalid order total for payment");
  }
  const amount = Math.round(total * 100)
  const currency = otps.currency || "usd";

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    description: `Order ${order._id}`,
    metadata: {
      orderId: order._id.toString(),
      userId: order.user.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    id : paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  }
  } catch(error){
    console.error("Stripe createPaymentIntent error", error)
    throw error
  }
}


export async function getPaymentIntent(paymentIntentId){
    try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error("Stripe getPaymentIntent error:", err);
    throw err;
  }
}

export async function createCheckoutSession(order, opts = {}) {
  try {
    if (!order || !order.totalPrice || !Array.isArray(order.orderItems)) {
      throw new Error("Invalid order data for checkout session");
    }

    const currency = opts.currency || "usd";
    const successUrl = opts.successUrl || `${opts.origin || ''}/checkout/success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = opts.cancelUrl || `${opts.origin || ''}/checkout/cancel?orderId=${order._id}`;

    const lineItems = order.orderItems.map((item) => {
      const price = Number(item.price || 0);
      const discountPct = Number(item.discountPercentage || 0);
      const discountedUnit = price * (1 - (isNaN(discountPct) ? 0 : discountPct) / 100);
      const unitAmount = Math.round(discountedUnit * 100);
      return {
        price_data: {
          currency,
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: Number(item.quantity || 1),
      };
    });

    // Add shipping and tax as separate lines if present
    if (Number(order.shippingPrice || 0) > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Shipping" },
          unit_amount: Math.round(Number(order.shippingPrice) * 100),
        },
        quantity: 1,
      });
    }

    if (Number(order.taxPrice || 0) > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Tax" },
          unit_amount: Math.round(Number(order.taxPrice) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId: order._id.toString(),
        userId: order.user.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Stripe createCheckoutSession error", error);
    throw error;
  }
}

export async function getCheckoutSession(sessionId) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });
  } catch (err) {
    console.error("Stripe getCheckoutSession error:", err);
    throw err;
  }
}

// export async function handleStripeWebhooks(req,res,next){
//     try{
//         const sig = req.headers["stripe-signature"];
//         const event = stripe.webhooks.constructEvent(
//             req.rawBody,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET
//         )

//         switch(event.type){
//             case "payment_intent.succeeded":
//                 console.log("Payment Succeeded", event.data.object.id);
//                 break;
//             case "payment_intent.payment_failed":
//                 console.log("Payment Failed", event.data.object.id);
//                 break;
//             default:
//                 console.log(`Unhandled event type ${event.type}`);
//         }
//         res.status(200).send({received: true})
//         }
//         catch(error){
//             console.log("Stripe webhook error", error)
//             res.status(400).send({received: false})
//         }
//     }
