import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

export const generateToken = (user) => {
    const payload = { id: user._id.toString(), role: user.role };
    return jwt.sign(
        payload,
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export const verifyToken = (token) => {
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(error) {
        throw new Error('Invalid Token or Expired Token');
    }
}