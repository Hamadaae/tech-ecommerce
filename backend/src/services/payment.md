
## ⚙️ Setup and Dependencies

### Required Packages:
- **stripe** – official Stripe API client
- **dotenv** – loads environment variables from `.env`

### Environment Variables:
Add the following to your `.env` file:

```bash
STRIPE_SECRET_KEY=sk_test_yourSecretKeyHere
STRIPE_WEBHOOK_SECRET=whsec_yourWebhookSecretHere   # Optional, for webhooks
````

---

## 🧩 `services/payment.js`

### Overview

This module handles creating and retrieving Stripe payment intents for customer orders.

---

### 🧠 Initialization

```js
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
```

* Loads environment variables.
* Initializes a Stripe instance using your secret key.
* Ensures compatibility by locking to a specific API version.

---

### 💰 `createPaymentIntent(order, otps = {})`

#### Description

Creates a **Stripe PaymentIntent** for the given order.
It verifies order validity, converts the price to cents, and returns a `clientSecret` to complete the payment on the frontend.

#### Code

```js
export async function createPaymentIntent(order, otps = {}) {
  try {
    if (!order || !order.totalPrice) {
      throw new Error("Invalid order data for payment");
    }

    const total = Number(order.totalPrice || 0);
    if (Number.isNaN(total) || total <= 0) {
      throw new Error("Invalid order total for payment");
    }

    const amount = Math.round(total * 100);
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
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Stripe createPaymentIntent error", error);
    throw error;
  }
}
```

#### Behavior

| Step | Description                                   |
| ---- | --------------------------------------------- |
| 1    | Validates the `order` object and total amount |
| 2    | Converts total price to cents (`* 100`)       |
| 3    | Creates a Stripe PaymentIntent with metadata  |
| 4    | Returns PaymentIntent ID and client secret    |
| 5    | Handles and logs Stripe API errors            |

#### Example Usage

```js
const order = {
  _id: "64a9c78d",
  user: "64a9a21b",
  totalPrice: 120.50
};

const payment = await createPaymentIntent(order);
console.log(payment.clientSecret);
```

---

### 🔍 `getPaymentIntent(paymentIntentId)`

#### Description

Retrieves a specific payment intent by its ID from Stripe.

#### Code

```js
export async function getPaymentIntent(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error("Stripe getPaymentIntent error:", err);
    throw err;
  }
}
```

#### Example Usage

```js
const intent = await getPaymentIntent("pi_3Yw6EX7...");
console.log(intent.status);
```

---

### 🚧 (Optional) `handleStripeWebhooks` *(Commented Example)*

Stripe webhooks can notify your server of successful or failed payments.
This example shows how to validate webhook events.

#### Example (commented in your code)

```js
// export async function handleStripeWebhooks(req, res, next) {
//   try {
//     const sig = req.headers["stripe-signature"];
//     const event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     switch (event.type) {
//       case "payment_intent.succeeded":
//         console.log("Payment Succeeded", event.data.object.id);
//         break;
//       case "payment_intent.payment_failed":
//         console.log("Payment Failed", event.data.object.id);
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.status(200).send({ received: true });
//   } catch (error) {
//     console.log("Stripe webhook error", error);
//     res.status(400).send({ received: false });
//   }
// }
```

---

## 🧾 Summary

| Function                             | Purpose                                  | Returns                |
| ------------------------------------ | ---------------------------------------- | ---------------------- |
| `createPaymentIntent(order, otps)`   | Creates a Stripe payment intent          | `{ id, clientSecret }` |
| `getPaymentIntent(id)`               | Retrieves a payment intent by ID         | PaymentIntent object   |
| `handleStripeWebhooks(req,res,next)` | (Optional) Handles Stripe webhook events | API Response           |

---

## ✅ Best Practices

* Always validate the `order` before creating a payment intent.
* Use **test keys** in development and **live keys** in production.
* Store only the PaymentIntent ID in your database, not the client secret.
* Protect your webhook endpoint with signature verification.

