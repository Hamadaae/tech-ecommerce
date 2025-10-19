# Orders Controller — Documentation

This document describes the behaviour, routes, inputs, outputs and implementation notes for the Orders controller used in the backend. It targets the controller implementation that uses Mongoose, Express and the following conventions:

- `req.user = { id, role }` provided by `authMiddleware`.
- `adminMiddleware` exists and returns `401` for unauthorized admin access.
- MongoDB transactions (Mongoose sessions) are used to keep Order creation and Product stock updates atomic.
- Stripe integration is supported via `stripePaymentIntentId` and `paymentResult` fields on orders.

---

## Table of contents
- [Overview](#overview)
- [Schema notes](#schema-notes)
- [Helpers](#helpers)
- [Controller functions (list)](#controller-functions-list)
- [Detailed API documentation (per function)](#detailed-api-documentation-per-function)
  - `createOrder`
  - `getMyOrders`
  - `getOrderById`
  - `getAllOrders`
  - `updateOrderStatus`
  - `updateOrderToPaid`
  - `deleteOrder`
- [Errors & status codes](#errors--status-codes)
- [Stripe & webhook integration notes](#stripe--webhook-integration-notes)
- [Concurrency & data-safety considerations](#concurrency--data-safety-considerations)
- [Suggested schema additions](#suggested-schema-additions)

---

## Overview
The Orders controller manages order lifecycle operations for an e-commerce application. It supports two primary payment flows:

1. **Stripe (online)** — orders created as `pending` and finalized by webhook or explicit `updateOrderToPaid` when payment is confirmed.
2. **Cash on Delivery (COD)** — orders created immediately and stock decremented at creation time; `paymentStatus` remains `pending` until delivery/payment collection.

The controller enforces authentication for all endpoints and admin authorization for management actions.

---

## Schema notes
The Order model should include these key fields used by the controller:

- `user: ObjectId` (ref `User`) — order owner
- `orderItems: [{ product: ObjectId, name, quantity, price, image }]` — snapshot of items
- `shippingAddress: { address, city, postalCode, country }`
- `paymentMethod: 'stripe' | 'cash_on_delivery'`
- `paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'`
- `stripePaymentIntentId`, `stripeChargeId`, `stripeReceiptUrl`
- `itemsPrice`, `shippingPrice`, `taxPrice`, `totalPrice`
- `isPaid`, `paidAt`
- `isDelivered`, `deliveredAt`
- `stockReserved: Boolean` — (recommended) indicates whether product quantities were already decremented for this order

---

## Helpers
### `adjustStock(items, session = null, increment = false)`
- Purpose: decrement (or increment) product `quantity` fields for a list of `orderItems`.
- Behaviour:
  - When `increment === false` (decrement): uses `findOneAndUpdate({ _id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } })` to prevent oversells. If any update fails, throws `Insufficient stock` error (status 400).
  - When `increment === true` (restore): increments quantity without checks.
- Must be executed inside the same Mongoose session when used with transactions.

---

## Controller functions (list)
- `createOrder` — creates an order; may decrement stock immediately for COD or when client indicates `isPaid`.
- `getMyOrders` — returns orders for the authenticated user.
- `getOrderById` — returns a single order for owner or admin.
- `getAllOrders` — admin-only: lists orders with pagination & optional filters.
- `updateOrderStatus` — admin-only: update `status` and `isDelivered` flags.
- `updateOrderToPaid` — mark order as paid (idempotent). Decrements stock if not yet reserved.
- `deleteOrder` — admin-only: delete an order and restore stock if it was reserved and unpaid.

---

## Detailed API documentation (per function)

### `createOrder`
- **Route**: `POST /api/orders`
- **Auth**: required (any logged-in user)
- **Body** (example):
  ```json
  {
    "orderItems": [{ "product": "<id>", "name": "...", "quantity": 2, "price": 10, "image": "..." }],
    "shippingAddress": { "address":"...", "city":"...", "postalCode":"...", "country":"..." },
    "paymentMethod": "stripe" | "cash_on_delivery",
    "itemsPrice": 20,
    "taxPrice": 2,
    "shippingPrice": 3,
    "totalPrice": 25,
    "stripePaymentIntentId": "pi_...", // optional
    "isPaid": false // optional (rare; usually false)
  }
  ```
- **Behaviour**:
  - Validates `orderItems` exist.
  - Starts a Mongoose transaction (session).
  - If `paymentMethod === 'cash_on_delivery'`: calls `adjustStock(..., session, false)` and sets `stockReserved = true`.
  - If `paymentMethod === 'stripe'` and `isPaid === true`: decrements stock and marks the order as paid.
  - Otherwise (Stripe unpaid): creates order with `paymentStatus: 'pending'` and `stockReserved: false`.
  - Saves the order inside the session and commits. Returns `201` with created order.
- **Errors**:
  - `400` if `orderItems` missing or if insufficient stock when decrementing.
  - `401` if user not authenticated.


### `getMyOrders`
- **Route**: `GET /api/orders/my-orders`
- **Auth**: required
- **Behaviour**: returns `Order.find({ user: req.user.id })` sorted by `createdAt desc`.
- **Errors**: `401` if unauthenticated.


### `getOrderById`
- **Route**: `GET /api/orders/:id`
- **Auth**: required
- **Behaviour**:
  - Loads order and populates user name/email.
  - Only owner or admin may access.
- **Errors**:
  - `404` if not found
  - `401` if unauthorized or unauthenticated


### `getAllOrders`
- **Route**: `GET /api/orders`
- **Auth**: admin-only
- **Query**: `?page=1&limit=20&paymentStatus=paid&paymentMethod=stripe&user=<id>`
- **Behaviour**: returns paginated list: `{ data, meta: { page, limit, total, pages } }`.
- **Errors**: `401` if not admin.


### `updateOrderStatus`
- **Route**: `PUT /api/orders/:id/status`
- **Auth**: admin-only
- **Body**: `{ status?: string, isDelivered?: boolean }`
- **Behaviour**:
  - Updates `status` if provided.
  - If `isDelivered === true` and order was not delivered, set `isDelivered = true` and `deliveredAt = Date.now()`.
- **Errors**: `404` if not found, `401` if not admin.


### `updateOrderToPaid`
- **Route**: `PUT /api/orders/:id/pay`
- **Auth**: owner or admin (webhook integration note below)
- **Body**: optional `paymentResult` object `{ id, status, email_address }`
- **Behaviour**:
  - Starts a mongoose session/transaction.
  - If order already `isPaid` -> idempotent return.
  - If `stockReserved` is false, calls `adjustStock(...)` to decrement now and mark `stockReserved = true`.
  - Sets `isPaid = true`, `paymentStatus = 'paid'`, `paidAt = Date.now()` and saves paymentResult/stripePaymentIntentId if provided.
  - Commits transaction and returns updated order.
- **Errors**: `401` if not owner/admin, `404` if not found.


### `deleteOrder`
- **Route**: `DELETE /api/orders/:id`
- **Auth**: admin-only
- **Behaviour**:
  - If `stockReserved && !isPaid`: restores stock by calling `adjustStock(..., increment = true)` in a transaction.
  - Deletes order document.
- **Errors**: `404` if not found, `401` if not admin.

---

## Errors & status codes
The controller uses `next(err)` with `err.statusCode` set on errors. The central `errorMiddleware` should handle common Mongoose errors (ValidationError, CastError, duplicate key), JWT errors, and generic fallback errors. Example codes used:

- `400` — validation, insufficient stock
- `401` — authentication/authorization failures (per your middleware pattern)
- `404` — resource not found
- `409` — duplicate (rare for orders)
- `500` — server errors

---

## Stripe & webhook integration notes
- For Stripe flows, prefer using webhooks as the source-of-truth. Typical pattern:
  1. Frontend creates a Stripe Checkout Session or PaymentIntent through your payment endpoint.
  2. User completes payment on Stripe.
  3. Stripe sends `payment_intent.succeeded` (or `checkout.session.completed`) to your webhook.
  4. Webhook verifies signature and calls the same transactional logic used by `updateOrderToPaid`, or directly marks the order paid and decrements stock if needed.
- Important: Webhooks won't have `req.user`. Either:
  - Use the `stripePaymentIntentId` saved on the order and look up the order by that id, then run the transactional finalize logic; OR
  - Allow a system-level bypass for webhook calls (validate with Stripe signature) so you can mark the order paid.
- Always use idempotency checks: if an order is already `isPaid`, ignore a repeated webhook event.

---

## Concurrency & data-safety considerations
- Use Mongoose transactions (replica set required) when modifying `Order` and `Product` together.
- If transactions are not available, use `findOneAndUpdate` with `quantity: { $gte }` and only create the order after all `findOneAndUpdate` succeed (or rollback via compensating updates).
- Use idempotency keys for webhook processing (store `stripePaymentIntentId` and check if the order was already processed).
- Consider TTL or background job to release reserved stock when pending orders stay unpaid for too long.

---

## Suggested schema additions
Add the following to the Order schema for better tracking and safety:

```js
stockReserved: { type: Boolean, default: false },
status: { type: String, enum: ['pending','processing','shipped','delivered','cancelled','returned'], default: 'pending' }
```

These fields let you track whether stock was already decremented and the business-level order status separately from payment status.

---

## Example notes for implementers
- Always `await session.commitTransaction()` before returning to the client.
- For webhook endpoints, configure Express to use `bodyParser.raw({ type: 'application/json' })` for the route so Stripe signature verification works.
- Make sure `Product.quantity` has an index and is a Number.

---

If you want, I can also generate:
- A concise OpenAPI (Swagger) snippet for these endpoints.
- A ready-to-paste `order.routes.js` wired with `authMiddleware` and `adminMiddleware`.
- A Stripe webhook controller that finalizes orders using the same transactional logic.

Which of those next?

