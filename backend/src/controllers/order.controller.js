import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Adjust product stock quantities when orders are created, paid, or deleted.
 * - Decrease stock when an order is placed.
 * - Increase stock (rollback) when an order is canceled or deleted.
 *
 * @param {Array} items - The ordered items with product IDs and quantities.
 * @param {mongoose.ClientSession} session - MongoDB transaction session.
 * @param {boolean} increment - If true, increases stock (restore); else decreases.
 */
async function adjustStock(items, session = null, increment = false) {
  for (const item of items) {
    // Choose increment or decrement operation based on context
    const op = increment
      ? { $inc: { quantity: item.quantity } }
      : { $inc: { quantity: -item.quantity } };

    if (!increment) {
      // Ensure product has enough stock before decrementing
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, quantity: { $gte: item.quantity } },
        op,
        { session, new: true }
      );
      if (!updated) {
        const err = new Error(`Insufficient stock for product ${item.product}`);
        err.statusCode = 400;
        throw err;
      }
    } else {
      // Increment back stock on order cancellation/deletion
      await Product.updateOne({ _id: item.product }, op, { session });
    }
  }
}

/**
 * Create a new order
 * - Verifies user authentication
 * - Validates request body
 * - Reserves stock for "cash on delivery" or "paid" Stripe payments
 * - Uses a transaction to ensure atomicity between stock and order creation
 */
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Require authentication
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    // Extract order fields from request body
    const {
      orderItems,
      shippingAddress,
      paymentMethod = "stripe",
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      totalPrice,
      stripePaymentIntentId = null,
      isPaid = false,
    } = req.body;

    // Validate presence of order items
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      const err = new Error("No order items");
      err.statusCode = 400;
      return next(err);
    }

    // Prepare base order document
    const orderDoc = {
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      stripePaymentIntentId,
      isPaid: false,
      paymentStatus: "pending",
    };

    let stockReserved = false;

    // --- Handle stock depending on payment method ---
    if (
      paymentMethod === "cash_on_delivery" ||
      paymentMethod === "cash_on_delivery".toLowerCase()
    ) {
      // For COD orders → immediately reserve stock
      await adjustStock(orderItems, session, false);
      stockReserved = true;
    } else if (paymentMethod === "stripe") {
      // For Stripe orders → reserve stock only if payment succeeded
      if (isPaid) {
        await adjustStock(orderItems, session, false);
        stockReserved = true;
        orderDoc.paymentStatus = "paid";
        orderDoc.isPaid = true;
        orderDoc.paidAt = new Date();
      }
    }

    // Mark whether stock was reserved for this order
    orderDoc.stockReserved = stockReserved;

    // Create order within the transaction
    const [createdOrder] = await Order.create([orderDoc], { session });

    // Commit transaction and close session
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * Fetch all orders belonging to the logged-in user
 */
export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

/**
 * Get single order details by ID
 * - Accessible by the order owner or admin only
 */
export const getOrderById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Verify ownership or admin privilege
    const isOwner = order.user._id.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all orders (Admin only)
 * - Supports pagination and filters by user, payment status, or payment method
 */
export const getAllOrders = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      data: orders,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update order status or delivery info (Admin only)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    const { status, isDelivered } = req.body;

    if (typeof status !== "undefined") order.status = status;

    // Toggle delivery state and timestamp
    if (isDelivered && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (!isDelivered && order.isDelivered) {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updated = await order.save();
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

/**
 * Mark an order as paid (User or Admin)
 * - Verifies user ownership
 * - Reserves stock if not already done
 * - Updates payment details and marks order paid
 */
export const updateOrderToPaid = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    const isOwner = order.user._id.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    // Skip if already paid
    if (order.isPaid) {
      await session.commitTransaction();
      session.endSession();
      return res.json(order);
    }

    // Reserve stock if not done already
    if (!order.stockReserved) {
      await adjustStock(order.orderItems, session, false);
      order.stockReserved = true;
    }

    // Mark order as paid
    order.isPaid = true;
    order.paymentStatus = "paid";
    order.paidAt = new Date();

    // Attach payment details if available
    if (req.body.paymentResult) {
      order.paymentResult = req.body.paymentResult;
      if (req.body.paymentResult.id) {
        order.stripePaymentIntentId = req.body.paymentResult.id;
      }
    }

    const updated = await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json(updated);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

/**
 * Delete an order (Admin only)
 * - Restores stock if order was not paid but stock was reserved
 */
export const deleteOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user || req.user.role !== "admin") {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Restore stock if it was reserved but not paid
    if (order.stockReserved && !order.isPaid) {
      await adjustStock(order.orderItems, session, true);
    }

    await order.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};
