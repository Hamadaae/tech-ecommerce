# API Routes — Users & Products

> Frontend-friendly API reference (save as `API_ROUTES.md` and share with the team).
> Base URL: `http://localhost:5000/api`

---

## Quick endpoints table

|                  Resource | Method | Endpoint                                              |
| ------------------------: | :----: | :---------------------------------------------------- |
|         List all products |   GET  | `/products`                                           |
| List products by category |   GET  | `/products?category=<category>`                       |
|         Get product by id |   GET  | `/products/{product_id}`                              |
|           List categories |   GET  | `/products/categories`                                |
|            Create product |  POST  | `/products`                                           |
|            Update product |   PUT  | `/products/{product_id}`                              |
|            Delete product | DELETE | `/products/{product_id}`                              |
|                     Login |  POST  | `/auth/login`                                         |
|                  Register |  POST  | `/auth/register`                                      |
|              Current user |   GET  | `/auth/me` (requires `Authorization: Bearer <token>`) |

---

## Products — Examples & details

### 1) Lists All Products

**GET** `http://localhost:5000/api/products`
**Query params (optional):**

* `page` — page number (e.g. `?page=1`)
* `limit` — number of items per page (e.g. `?limit=20`)
* `search` — search term (e.g. `?search=iphone`)
* `category` — filter by category (see examples below)

**Example responses (200):**

```json
{
  "data": [
    {
      "_id": "65a2f123...",
      "name": "Smartphone X",
      "price": 699.99,
      "category": "smartphones",
      "stock": 12
    },
    { "...": "..." }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 124
  }
}
```

---

### 2) Lists Smartphones Category

**GET** `http://localhost:5000/api/products?category=smartphones`
(works same for other categories)

---

### 3) Lists Laptops Category

**GET** `http://localhost:5000/api/products?category=laptops`

---

### 4) Lists Tablets Category

**GET** `http://localhost:5000/api/products?category=tablets`

---

### 5) Lists Mobile Accessories

**GET** `http://localhost:5000/api/products?category=mobile-accessories`

---

### 6) GET Product By Id

**GET** `http://localhost:5000/api/products/{product_id}`
**Success (200):**

```json
{
  "_id": "65a2f123...",
  "name": "Smartphone X",
  "description": "Full description here",
  "price": 699.99,
  "category": "smartphones",
  "stock": 12,
  "images": ["url1","url2"],
  "createdAt": "2025-10-12T14:32:00.000Z"
}
```

**Error (404):**

```json
{ "message": "Product not found" }
```

---

### 7) Lists Categories

**GET** `http://localhost:5000/api/products/categories`
**Response (200):**

```json
["smartphones", "laptops", "tablets", "mobile-accessories", "audio"]
```

---

### 8) Create New Product

**POST** `http://localhost:5000/api/products`
**Auth:** Required (`Authorization: Bearer <TOKEN>`)
**Body (JSON):**

```json
{
  "name": "New Product",
  "description": "Detailed description",
  "price": 49.99,
  "category": "mobile-accessories",
  "stock": 50,
  "images": ["https://..."]
}
```

**Success (201):**

```json
{
  "_id": "65b8d999...",
  "name": "New Product",
  "price": 49.99,
  "category": "mobile-accessories",
  "stock": 50
}
```

**Errors:**

* `400` validation error (missing fields)
* `401` unauthorized (no/invalid token)

---

### 9) Updates a Product

**PUT** `http://localhost:5000/api/products/{product_id}`
**Auth:** Required (`Authorization: Bearer <TOKEN>`)
**Body (any updatable fields):**

```json
{
  "name": "Updated Product Name",
  "price": 59.99,
  "stock": 40
}
```

**Success (200):**

```json
{
  "_id": "65b8d999...",
  "name": "Updated Product Name",
  "price": 59.99,
  "category": "mobile-accessories",
  "stock": 40
}
```

**Errors:**

* `404` product not found
* `401` unauthorized

---

### 10) Delete a Product

**DELETE** `http://localhost:5000/api/products/{product_id}`
**Auth:** Required (`Authorization: Bearer <TOKEN>`)
**Success (200):**

```json
{ "message": "Product deleted successfully" }
```

**Errors:**

* `404` product not found
* `401` unauthorized

---

## Auth & Users — Examples & details

### Login User/Admin

**POST** `http://localhost:5000/api/auth/login`
**Body (JSON):**

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

**Success (200):**

```json
{
  "user": {
    "id": "64f1ab23...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "JWT_TOKEN_HERE"
}
```

**Errors:**

* `400` validation error
* `401` invalid credentials

---

### Register User

**POST** `http://localhost:5000/api/auth/register`
**Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success (201):**

```json
{
  "user": {
    "id": "64f1ab23...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "JWT_TOKEN_HERE"
}
```

**Errors:**

* `400` validation error
* `409` email already exists

---

### User Authorization (current user)

**GET** `http://localhost:5000/api/auth/me`
**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Success (200):**

```json
{
  "id": "64f1ab23...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2025-10-12T14:32:00.000Z"
}
```

**Errors:**

* `401` missing/invalid token

---

## Common headers & notes for frontend

* **Base URL**: `http://localhost:5000/api` (update for staging/prod).
* **Auth header** for protected routes:

  ```
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
* **Content-Type** for JSON bodies:

  ```
  Content-Type: application/json
  ```
* **Store token**: store JWT in memory or `localStorage` depending on auth strategy (team decision). Use HTTP-only cookies if backend supports them and you prefer more secure approach.
* **Error handling**: expect `400`, `401`, `403`, `404`, `409`, `500`. Show a user-friendly message and log the details in dev console.
* **IDs**: URLs using `{product_id}` expect the product `_id` (MongoDB-style string) or numeric id depending on backend implementation — use the value returned by the API.

---

## Example curl snippets (for quick testing)

List all products:

```bash
curl http://localhost:5000/api/products
```

List laptops:

```bash
curl "http://localhost:5000/api/products?category=laptops"
```

Get product:

```bash
curl http://localhost:5000/api/products/65a2f123...
```

Create product (protected):

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"New Product","price":49.99,"category":"mobile-accessories","stock":50}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret123"}'
```

---
