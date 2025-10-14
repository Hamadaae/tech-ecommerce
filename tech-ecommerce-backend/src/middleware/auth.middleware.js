import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/helpers';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    // Check for 'Bearer <token>'
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: 'No Token Provided' });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    res.status(401).json({ message: error.message || 'Invalid Token' });
  }
}
