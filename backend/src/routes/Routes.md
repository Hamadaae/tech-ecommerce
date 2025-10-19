# Backend Routes Overview

## 🧑‍💼 Auth Routes (`auth.routes.js`)

### Base Path: `/api/auth`

| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|--------------|
| **POST** | `/register` | `express-validator` | Registers a new user. Requires name, email, and password. |
| **POST** | `/login` | `express-validator` | Logs in a user and returns a JWT token. |
| **GET** | `/me` | `authMiddleware` | Returns current logged-in user's data. |

### Validation Rules
- `name`: Minimum 3 characters.  
- `email`: Must be valid email format.  
- `password`: Minimum 6 characters.  

### Notes
- Input validation handled via `express-validator`.
- Token verification handled in `authMiddleware`.
- Password hashing and token generation handled in the controller using helpers.

---

## 🛍️ Product Routes (`product.routes.js`)

### Base Path: `/api/products`

| Method | Endpoint | Middleware | Description |
|--------|-----------|-------------|--------------|
| **GET** | `/` | — | Fetch all products (supports optional category or search filters). |
| **GET** | `/categories` | — | Returns all unique product categories. |
| **GET** | `/:id` | — | Fetch product by its ID. |
| **POST** | `/` | `authMiddleware` | Create a new product (authenticated users). |
| **PUT** | `/:id` | `authMiddleware` | Update an existing product. |
| **DELETE** | `/:id` | `authMiddleware` | Delete a product. |

### Features
- Supports filtering by `category` and text search (via MongoDB text index).
- Includes product CRUD functionality.
- Requires authentication for write operations.

### Example Request (POST /api/products)
```json
{
  "title": "MacBook Air M3",
  "category": "Laptops",
  "price": 1499,
  "stock": 10,
  "brand": "Apple"
}
````

---

## 📦 Order Routes (`order.routes.js`)

### Base Path: `/api/orders`

| Method     | Endpoint      | Middleware                          | Description                                          |
| ---------- | ------------- | ----------------------------------- | ---------------------------------------------------- |
| **POST**   | `/`           | `authMiddleware`                    | Create a new order (user only).                      |
| **GET**    | `/my`         | `authMiddleware`                    | Get logged-in user's orders.                         |
| **GET**    | `/:id`        | `authMiddleware`                    | Get details for a specific order (only owner/admin). |
| **PUT**    | `/:id/pay`    | `authMiddleware`                    | Update order to paid after successful payment.       |
| **GET**    | `/`           | `authMiddleware`, `adminMiddleware` | Admin: Get all orders.                               |
| **PUT**    | `/:id/status` | `authMiddleware`, `adminMiddleware` | Admin: Update delivery status.                       |
| **DELETE** | `/:id`        | `authMiddleware`, `adminMiddleware` | Admin: Delete order.                                 |

### Features

* Fully protected endpoints (split between user and admin access).
* Stripe integration for `updateOrderToPaid`.
* Includes user and admin-level functionality.
* Automatically checks and updates product stock via `services/order.service.js`.

### Example Flow

1. **User** creates order → `/api/orders`
2. **Stripe** payment → `/api/orders/:id/pay`
3. **Admin** updates delivery → `/api/orders/:id/status`

---

## 🔐 Middleware Overview (Used Across Routes)

| Middleware        | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `authMiddleware`  | Verifies JWT token and attaches user data to `req.user`. |
| `adminMiddleware` | Allows access only to users with `role: 'admin'`.        |

---

## Summary Table

| Area               | File                | Description                                                     |
| ------------------ | ------------------- | --------------------------------------------------------------- |
| **Authentication** | `auth.routes.js`    | Handles user registration, login, and profile retrieval.        |
| **Products**       | `product.routes.js` | CRUD and category retrieval for product management.             |
| **Orders**         | `order.routes.js`   | Handles order lifecycle including payment and admin operations. |

