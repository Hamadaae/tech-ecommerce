import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/helpers.js';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      const err = new Error('No Token provided')
      err.statusCode = 401
      return next(err)
    }

    let decoded 
    try{
      decoded = verifyToken(token);
    } catch(jwtError){
        jwtError.statusCode = 401
        return next(jwtError)
    }

    req.user = { id : decoded.id, role : decoded.role };
    next();
  } catch (error) {
      error.statusCode = error.statusCode || 401
    next(error);
  }
}
