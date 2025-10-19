## 📁 Folder Structure

```

src/
└── middleware/
├── admin.middleware.js
├── auth.middleware.js
└── error.middleware.js

````

---

## 🔐 `auth.middleware.js`

### Purpose
Validates JWT tokens sent by clients and attaches the authenticated user’s info to the `req` object.  
If no token or an invalid token is provided, the middleware throws an authentication error.

### Code
```js
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/helpers.js';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    // Check for 'Bearer <token>'
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      const err = new Error('No Token provided');
      err.statusCode = 401;
      return next(err);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      jwtError.statusCode = 401;
      return next(jwtError);
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}
````

### Behavior

* ✅ Verifies the presence of a Bearer token.
* ✅ Decodes the JWT using a helper function.
* ✅ Adds `req.user = { id, role }` for use in protected routes.
* ❌ Throws a `401 Unauthorized` error if token is missing or invalid.

---

## 🛡️ `admin.middleware.js`

### Purpose

Ensures only admin users can access certain routes.
It checks if `req.user` exists and if their role is `admin`.

### Code

```js
export default function adminMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      const err = new Error('Unauthorized');
      err.statusCode = 401;
      return next(err);
    }
    next();
  } catch (error) {
    error.statusCode = 403;
    next(error);
  }
}
```

### Behavior

* ✅ Allows access only if the authenticated user is an admin.
* ❌ Returns `401 Unauthorized` if not admin.
* ⚠️ Returns `403 Forbidden` for unexpected internal errors.

---

## 🚨 `error.middleware.js`

### Purpose

Global error handler for all API routes.
Handles validation, JWT, duplicate keys, and other common errors gracefully.

### Code

```js
export default function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Invalid ObjectId or malformed query
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path} : ${err.value}`,
    });
  }

  // Duplicate key (MongoDB)
  if (err.code && err.code === 11000) {
    const dupKeys = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate key error: ${dupKeys}`,
      fields: err.keyValue,
    });
  }

  // Invalid JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid Token',
    });
  }

  // Expired JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token Expired',
    });
  }

  // Express-validator custom error type
  if (err.type === 'express-validator') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors || [],
    });
  }

  return res.status(statusCode).json(payload);
}
```

### Behavior

| Error Type        | Status | Message Example              |
| ----------------- | ------ | ---------------------------- |
| ValidationError   | 400    | "Validation Error"           |
| CastError         | 400    | "Invalid _id: 123abc"        |
| Duplicate Key     | 409    | "Duplicate key error: email" |
| JsonWebTokenError | 401    | "Invalid Token"              |
| TokenExpiredError | 401    | "Token Expired"              |
| express-validator | 400    | "Validation Error"           |
| Default           | 500    | "Internal Server Error"      |

---

## 🧠 Summary

| Middleware            | Purpose                              | Typical Status Codes        |
| --------------------- | ------------------------------------ | --------------------------- |
| `auth.middleware.js`  | Authenticate requests using JWT      | 401                         |
| `admin.middleware.js` | Restrict access to admin users       | 401 / 403                   |
| `error.middleware.js` | Handle all backend errors gracefully | 400 / 401 / 403 / 409 / 500 |

---

## ✅ Usage Example

In your `server.js` or `app.js`:

```js
import express from 'express';
import authMiddleware from './middleware/auth.middleware.js';
import adminMiddleware from './middleware/admin.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

// Protected route example
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

// Global error handler
app.use(errorMiddleware);
```

---


