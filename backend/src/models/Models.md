# Backend Models Overview

## 🧾 Order Model (`Order.js`)

### Structure Overview
The `Order` model defines how customer orders are stored and managed. It includes embedded schemas for items and shipping details.

### **Schemas**
#### 🔹 Order Item Schema
```js
{
  product: ObjectId,       // Reference to Product model
  name: String,            // Product name snapshot
  quantity: Number,        // Ordered quantity
  price: Number,           // Unit price at time of purchase
  discountPercentage: Number, // Optional discount
  image: String,           // Product image URL
  subTotal: Number         // Calculated: (price * quantity) - discount
}
```

#### 🔹 Order Schema
```js
{
  user: ObjectId,                 // Linked User
  orderItems: [orderItemSchema],  // Array of products in the order

  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },

  paymentMethod: {
    type: String,
    enum: ['stripe', 'cash_on_delivery'],
    default: 'stripe'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  stripePaymentIntentId: String,
  stripeChargeId: String,
  stripeReceiptUrl: String,

  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,

  isPaid: Boolean,
  paidAt: Date,

  isDelivered: Boolean,
  deliveredAt: Date,

  stockReserved: Boolean
}
```

### **Features**
- Stripe-ready fields for integration (`paymentIntentId`, `receiptUrl`).
- Stock reservation tracking (`stockReserved`).
- Built-in timestamps (`createdAt`, `updatedAt`).
- Full user and product reference linking.

---

## 🛒 Product Model (`Product.js`)

### Structure Overview
The `Product` model captures all details about products, including metadata, reviews, stock, and SEO-related info.

### **Schemas**
#### 🔹 Review Schema
```js
{
  rating: Number,          // 1–5 rating
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String
}
```

#### 🔹 Dimensions Schema
```js
{
  width: Number,
  height: Number,
  depth: Number
}
```

#### 🔹 Meta Schema
```js
{
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String
}
```

#### 🔹 Product Schema
```js
{
  externalId: Number,
  title: String,
  description: String,
  category: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: dimensionsSchema,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  reviews: [reviewSchema],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  meta: metaSchema,
  images: [String],
  thumbnail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Features**
- **Text index** on `title`, `description`, `brand`, and `tags` for fast searching.
- `pre('save')` hook auto-updates `updatedAt` field.
- Virtual field **Average Rating** auto-calculates average review score.
- Designed for extensibility and product analytics.
- Default timestamps ensure reliable historical tracking.

---

## 👤 User Model (`User.js`)

### **Schema**
```js
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}
```

### **Features**
- Email is **unique**, **lowercased**, and **indexed** for efficient lookup.
- Role-based access control with enum values (`admin` / `user`).
- Custom `toJSON()` method automatically **removes password** before returning user objects in API responses.
- Integrated with JWT-based authentication in controllers.
- Uses `timestamps` for account creation and update tracking.

---

## ⚙️ Relationships Summary

| Model | References | Embedded | Notes |
|--------|-------------|-----------|--------|
| **Order** | User, Product | OrderItemSchema, ShippingAddress | Full transaction tracking |
| **Product** | — | Review, Dimensions, Meta | Indexed, search-ready, extensible |
| **User** | — | — | Authentication & authorization |

---

## 🧩 General Notes
- All schemas use **Mongoose Timestamps** for automatic creation and update tracking.
- **Validation** ensures required fields like product `title`, order `address`, and user `email/password`.
- The structure supports scalability and integration with payment, review, and stock systems.

---

## ✅ Example MongoDB Collections

### orders
```json
{
  "_id": "653f09b23c6a21c8e47345a1",
  "user": "653f081b31a22b8d9f738b4e",
  "orderItems": [
    {
      "product": "653f081b31a22b8d9f738b4e",
      "name": "MacBook Air M3",
      "quantity": 1,
      "price": 1299,
      "subTotal": 1299
    }
  ],
  "shippingAddress": {
    "address": "12 Apple Park Way",
    "city": "Cupertino",
    "postalCode": "95014",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "totalPrice": 1335.45,
  "isPaid": true,
  "paidAt": "2025-10-19T11:00:00.000Z"
}
```

### users
```json
{
  "_id": "653f081b31a22b8d9f738b4e",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2025-10-18T10:00:00.000Z"
}
```

### products
```json
{
  "_id": "653f09b23c6a21c8e47345a1",
  "title": "iPhone 16 Pro",
  "price": 1199,
  "category": "smartphones",
  "stock": 12,
  "rating": 4.8,
  "tags": ["apple", "smartphone", "ios"],
  "thumbnail": "https://example.com/iphone16.jpg"
}
```

---

## 📘 Summary
| Model | Description | Key Features |
|--------|--------------|--------------|
| **Order** | Handles full order lifecycle and payments | Stripe integration, stock reservation, user link |
| **Product** | Stores product metadata, pricing, and reviews | Text indexing, dynamic rating, timestamps |
| **User** | Authentication and access control | Secure password handling, role-based system |
