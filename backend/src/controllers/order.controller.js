import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createPaymentIntent , getPaymentIntent } from "../services/payment.js";
import { adjustStock } from "../utils/helpers.js";
/**
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod = "stripe",
      taxPrice = 0,
      shippingPrice = 0,
      stripePaymentIntentId = null,
      isPaid = false,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      const err = new Error("No order items provided");
      err.statusCode = 400;
      return next(err);
    }

    // Fetch product details
    const productIds = orderItems.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    const newOrderItems = orderItems.map((item) => {
      const pid = item.product?.toString?.();
      const productDoc = productMap.get(pid);

      if (!productDoc) {
        const err = new Error(`Product ${pid} not found`);
        err.statusCode = 404;
        throw err;
      }

      const qty = Number(item.quantity || item.qty || 0);
      if (!qty || qty <= 0) {
        const err = new Error(`Invalid quantity for product ${pid}`);
        err.statusCode = 400;
        throw err;
      }

      if (
        typeof productDoc.minimumOrderQuantity === "number" &&
        qty < productDoc.minimumOrderQuantity
      ) {
        const err = new Error(
          `Minimum order quantity for ${productDoc.title} is ${productDoc.minimumOrderQuantity}`
        );
        err.statusCode = 400;
        throw err;
      }

      if (typeof productDoc.stock === "number" && qty > productDoc.stock) {
        const err = new Error(
          `Insufficient stock for ${productDoc.title}. Available: ${productDoc.stock}`
        );
        err.statusCode = 400;
        throw err;
      }

      const price = Number(productDoc.price || 0);
      const discountPercentage = Number(productDoc.discountPercentage || 0);
      const image =
        Array.isArray(productDoc.images) && productDoc.images.length > 0
          ? productDoc.images[0]
          : null;

      const discount = discountPercentage / 100;
      const subTotal = Math.round(price * qty * (1 - discount) * 100) / 100;

      return {
        product: productDoc._id,
        name: productDoc.title,
        quantity: qty,
        price,
        discountPercentage,
        image,
        subTotal,
      };
    });

    // Calculate order totals
    const itemsPrice = newOrderItems.reduce(
      (acc, item) => acc + item.subTotal,
      0
    );

    const normalizedShipping = Number(shippingPrice || 0);
    const normalizedTax = Number(taxPrice || 0);
    const totalPrice =
      Math.round((itemsPrice + normalizedShipping + normalizedTax) * 100) / 100;

    // Prepare order document
    const orderDoc = {
      user: req.user.id,
      orderItems: newOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice: normalizedShipping,
      taxPrice: normalizedTax,
      totalPrice,
      isPaid: false,
      stripePaymentIntentId,
      paymentStatus: "pending",
    };

    let stockReserved = false;
    if(paymentMethod.toLowerCase() === "cash_on_delivery") {
      await adjustStock(newOrderItems, false);
      stockReserved = true;
    }

    orderDoc.stockReserved = stockReserved;

    const createdOrder = await Order.create(orderDoc)

    let clientSecret = null

    if(paymentMethod.toLowerCase() === 'stripe'){
      const paymentIntent = await createPaymentIntent(createdOrder)
      createdOrder.stripePaymentIntentId = paymentIntent.id
      await createdOrder.save()
      clientSecret = paymentIntent.clientSecret
    }

    res.status(201).json({
      message: "Order created successfully",
      order: createdOrder,
      clientSecret
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all orders for current user
 */
export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID (owner or admin)
 */
export const getOrderById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
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

    res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all orders (paginated)
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

    res.json({
      data: orders,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update order delivery status
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

    const { isDelivered } = req.body;

    if (typeof isDelivered !== "undefined") {
      order.isDelivered = Boolean(isDelivered);
      order.deliveredAt = isDelivered ? new Date() : undefined;
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark order as paid (User/Admin)
 */
/**
 * Mark order as paid (User/Admin)
 */
// controllers/order.controller.js (updateOrderToPaid)
export const updateOrderToPaid = async (req, res, next) => {
  try {
    // Auth check
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    // Load order
    const order = await Order.findById(req.params.id);
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

    // If already paid, return early
    if (order.isPaid) return res.json(order);

    // Preferred flow: client sends paymentResult.id (Stripe PaymentIntent id)
    if (req.body.paymentResult && req.body.paymentResult.id) {
      try {
        const paymentIntentId = req.body.paymentResult.id;
        const paymentIntent = await getPaymentIntent(paymentIntentId);

        // Ensure paymentIntent exists and has acceptable status
        if (!paymentIntent || !["succeeded", "requires_capture"].includes(paymentIntent.status)) {
          const err = new Error("Payment not confirmed by Stripe");
          err.statusCode = 400;
          return next(err);
        }

        // Extra safety: metadata.orderId should match this order (if you added metadata on creation)
        if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
          if (paymentIntent.metadata.orderId !== order._id.toString()) {
            const err = new Error("PaymentIntent metadata does not match order id");
            err.statusCode = 400;
            return next(err);
          }
        }

        // Extra safety: verify amount matches expected order total (in cents)
        const expectedAmount = Math.round(Number(order.totalPrice || 0) * 100);
        if (typeof paymentIntent.amount === "number" && paymentIntent.amount !== expectedAmount) {
          const err = new Error("Payment amount does not match order total");
          err.statusCode = 400;
          return next(err);
        }

        // Reserve stock (only if not already reserved)
        if (!order.stockReserved) {
          try {
            await adjustStock(order.orderItems, false);
            order.stockReserved = true;
          } catch (stockErr) {
            // If stock adjustment fails, surface the error (do NOT mark order paid)
            stockErr.statusCode = stockErr.statusCode || 400;
            return next(stockErr);
          }
        }

        // Persist payment info to the order
        order.isPaid = true;
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        order.stripePaymentIntentId = paymentIntentId;

        if (paymentIntent.charges && Array.isArray(paymentIntent.charges.data) && paymentIntent.charges.data.length > 0) {
          const charge = paymentIntent.charges.data[0];
          order.stripeChargeId = charge.id || order.stripeChargeId;
          order.stripeReceiptUrl = charge.receipt_url || order.stripeReceiptUrl;
        }

        order.paymentResult = req.body.paymentResult;
      } catch (err) {
        // pass stripe/getPaymentIntent errors to the centralized error handler
        return next(err);
      }
    } else if (isAdmin) {
      // Admin override: allow marking paid without paymentResult
      if (!order.stockReserved) {
        try {
          await adjustStock(order.orderItems, false);
          order.stockReserved = true;
        } catch (stockErr) {
          stockErr.statusCode = stockErr.statusCode || 400;
          return next(stockErr);
        }
      }

      order.isPaid = true;
      order.paymentStatus = "paid";
      order.paidAt = new Date();

      if (req.body.paymentResult) {
        order.paymentResult = req.body.paymentResult;
        if (req.body.paymentResult.id) {
          order.stripePaymentIntentId = req.body.paymentResult.id;
        }
      }
    } else {
      // Not owner and not admin, or no payment provided
      const err = new Error("paymentResult.id is required to mark order paid");
      err.statusCode = 400;
      return next(err);
    }

    // Save and return updated order
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};


/**
 * Admin: Delete order + restore stock if needed
*/
export const deleteOrder = async (req, res, next) => {
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

    if (order.stockReserved && !order.isPaid) {
      await adjustStock(order.orderItems, true);
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};
