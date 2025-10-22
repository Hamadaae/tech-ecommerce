import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/helpers.js";

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Invalid Input Data");
      err.statusCode = 401;
      err.type = "express-validator";
      err.errors = errors.array();
      return next(err);
    }

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      const err = new Error("User already exists");
      err.statusCode = 401;
      return next(err);
    }
    const hashed = await hashPassword(password);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = generateToken(user);
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Invalid Login Data");
      err.statusCode = 401;
      err.type = "express-validator";
      err.errors = errors.array();
      return next(err);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error("Invalid Credentials");
      err.statusCode = 401;
      return next(err);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid Credentials");
      err.statusCode = 401;
      return next(err);
    }

    const token = generateToken(user);
    return res.json({ user: user.toJSON(), token });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    return res.json(user.toJSON());
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    const { name, email, password } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password ? await hashPassword(password) : user.password;
    await user.save();
    return res.json(user.toJSON());
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};