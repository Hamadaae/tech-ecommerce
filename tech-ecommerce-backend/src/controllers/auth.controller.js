import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { generateToken } from './../utils/helpers';


export const register = async (req,res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if(exists) {
            return res.status(400).json({ message : 'User already exists' });
        }

        // const salt = await bcrypt.genSalt(10);
        // const hashed = await bcrypt.hash(password, salt);

        const hashed = await hashPassword(password);

        const user = new User({ name, email, password: hashed , role : 'user' });
        await user.save();

        const token = generateToken(user);
        return res.status(201).json({ user: user.toJSON(), token });

    } catch (error) {
        console.error('register error',error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}

export const login = async (req,res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).json({ message : 'Invalid credentials' });
        }
        const isMatch = await comparePassword(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ message : 'Invalid credentials' });
        }
        const token = generateToken(user);
        return res.json({ user: user.toJSON(), token });
    } catch (error) {
        console.error('login error',error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}


export const me = async (req,res) => {
    try {
        const userId = req.user?.id
        if(!userId){
            return res.status(401).json({ message : 'Unauthorized' });
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message : 'User not found' });
        }
        return res.json(user.toJSON());
    } catch(error) {
        console.error('me error',error);
        res.status(500).json({ message : error.message || 'Internal Server Error'})
    }
}