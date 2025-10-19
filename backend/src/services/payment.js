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
