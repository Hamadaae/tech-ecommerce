import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Hash plain password with bcrypt
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plaintext vs hashed password
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a signed JWT for the user
 */
export const generateToken = (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify JWT signature and return decoded payload
 * Throws if invalid or expired — caught by errorMiddleware
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Preserve JWT-specific error names (JsonWebTokenError, TokenExpiredError)
    throw err;
  }
};

/**
 * Adjust product stock quantities.
 * - Decrease stock when an order is placed.
 * - Increase stock when an order is canceled or deleted.
 */
export async function adjustStock(items, increment = false) {
  for (const item of items) {
    const op = increment
      ? { $inc: { stock: item.quantity } }
      : { $inc: { stock: -item.quantity } };

    if (!increment) {
      // Ensure stock availability before decrement
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        op,
        { new: true }
      );
      if (!updated) {
        const err = new Error(`Insufficient stock for product ${item.product}`);
        err.statusCode = 400;
        throw err;
      }
    } else {
      // Restore stock on rollback or deletion
      await Product.updateOne({ _id: item.product }, op);
    }
  }
}
