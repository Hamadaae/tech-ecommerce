# Backend Controllers Overview

## Auth Controller (`auth.controller.js`)

### Endpoints:
- **POST /api/auth/register** → Register a new user
- **POST /api/auth/login** → Login existing user
- **GET /api/auth/me** → Get current logged-in user details

### Features:
- Validates inputs using `express-validator`.
- Hashes passwords before saving using `bcryptjs`.
- Generates JWT tokens using a helper function.
- Handles invalid or duplicate user registration.
- Returns structured JSON with user data and token.

---

## Product Controller (`product.controller.js`)

### Endpoints:
- **GET /api/products** → Get all products (optional query: `category`)
- **GET /api/products/:id** → Get product details by ID
- **POST /api/products** → Create new product
- **PUT /api/products/:id** → Update product details
- **DELETE /api/products/:id** → Delete product

### Features:
- Supports category filtering.
- Includes full CRUD with validation and proper error handling.
- Uses lean queries for read optimization.

---

## Order Controller (`order.controller.js`)

### Endpoints:
- **POST /api/orders** → Create new order  
  Creates order, reserves stock, and integrates with Stripe for payments.
- **GET /api/orders/myorders** → Get orders for the current user.
- **GET /api/orders/:id** → Get single order details (authorized user/admin only).
- **GET /api/orders** → Admin: Get all orders (with pagination and filters).
- **PUT /api/orders/:id/pay** → Mark order as paid (Stripe verified or admin override).
- **PUT /api/orders/:id/status** → Admin: Update delivery status.
- **DELETE /api/orders/:id** → Admin: Delete order and restore stock if needed.

### Features:
- Payment integration via Stripe (create and verify PaymentIntent).
- Dynamic stock adjustment via `adjustStock()` helper.
- Supports both `cash_on_delivery` and `stripe` payment methods.
- Prevents invalid quantities and ensures minimum order compliance.
- Adds detailed payment validation and error reporting.
- Full authorization control for users and admins.

---

## Summary

| Controller | Responsibilities | Integrations |
|-------------|------------------|---------------|
| **Auth** | User registration, login, and profile | JWT, bcrypt |
| **Product** | Product management and retrieval | MongoDB |
| **Order** | Order creation, payment, and management | Stripe, MongoDB |

---

## Error Handling
All controllers use a centralized error middleware and `next(error)` forwarding with standardized HTTP codes:
- `401` → Unauthorized or invalid input.
- `404` → Resource not found.
- `400` → Bad request or validation issue.
- `500` → Internal server error.
