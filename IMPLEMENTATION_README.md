Implemented changes summary:
1) Implemented Orders page component logic (client/src/app/pages/orders/orders.ts) and template to fetch and list user's orders.
2) Implemented Admin page component logic (client/src/app/pages/admin/admin.ts) and template to list all orders, change status, and delete orders.
3) Implemented OrderDetail component to fetch & show a single order (client/src/app/pages/orders/order-detail.ts).
4) Added a demo Stripe component (client/src/app/pages/checkout/stripe-pay.ts) that calls OrderService.createOrder() and shows how to receive clientSecret. This is a minimal demo — for production integrate Stripe Elements and confirm payment with stripe.confirmCardPayment().

How to use / run:
- Backend: go to backend, install deps, set env vars (MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY) then `npm run dev`.
- Frontend: go to client, `npm install`, install stripe lib: `npm install @stripe/stripe-js`, then `ng serve`.
- Login as user/admin (use seed/createAdmin scripts if needed).
- Visit /orders to see user orders (requires auth token in localStorage).
- Visit admin page (route depends on app.routes.ts) to manage orders.

Files changed or added:
- client/src/app/pages/orders/orders.ts (new logic)
- client/src/app/pages/orders/orders.html (updated template)
- client/src/app/pages/orders/order-detail.ts (updated)
- client/src/app/pages/admin/admin.ts (new logic)
- client/src/app/pages/admin/admin.html (updated template)
- client/src/app/pages/checkout/stripe-pay.ts (new demo component)

Notes:
- I updated Angular component files only — you still need to wire routes/components in app.module or appropriate route files if the project doesn't auto-detect them.
- The Stripe demo is intentionally minimal; integrate Stripe Elements and call orderService.updateOrderToPaid(orderId, paymentResult) after confirming payment to update backend.

