import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../services/payment.js";
import { adjustStock } from "../utils/helpers.js";

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
      stripeCheckoutSessionId = null,
      isPaid = false,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      const err = new Error("No order items provided");
      err.statusCode = 400;
      return next(err);
    }

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

      // Removed minimumOrderQuantity constraint

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

    const itemsPrice = newOrderItems.reduce(
      (acc, item) => acc + item.subTotal,
      0
    );

    const normalizedShipping = Number(shippingPrice || 0);
    const normalizedTax = Number(taxPrice || 0);
    const totalPrice =
      Math.round((itemsPrice + normalizedShipping + normalizedTax) * 100) / 100;

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
      stripeCheckoutSessionId,
      paymentStatus: "pending",
    };

    let stockReserved = false;
    if (paymentMethod.toLowerCase() === "cash_on_delivery") {
      await adjustStock(newOrderItems, false);
      stockReserved = true;
    }

    orderDoc.stockReserved = stockReserved;

    const createdOrder = await Order.create(orderDoc);

    let checkoutSessionId = null;
    let checkoutUrl = null;

    if (paymentMethod.toLowerCase() === "stripe") {
      const origin =
        req.get("origin") || req.protocol + "://" + req.get("host");
      const session = await createCheckoutSession(createdOrder, { origin });
      createdOrder.stripeCheckoutSessionId = session.id;
      await createdOrder.save();
      checkoutSessionId = session.id;
      checkoutUrl = session.url;
    }

    res.status(201).json({
      message: "Order created successfully",
      order: createdOrder,
      checkoutSessionId,
      checkoutUrl,
    });
  } catch (error) {
    next(error);
  }
};

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

export const updateOrderToPaid = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

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

    if (order.isPaid) return res.json(order);

    if (req.body.sessionId) {
      try {
        const sessionId = req.body.sessionId;
        const session = await getCheckoutSession(sessionId);

        console.log("Updating order to paid:", {
          orderId: order._id.toString(),
          sessionId,
          paymentStatus: session?.payment_status,
        });

        if (!session || session.payment_status !== "paid") {
          console.error("Session not paid:", {
            sessionId,
            paymentStatus: session?.payment_status,
            sessionExists: !!session,
          });
          const err = new Error("Checkout Session not paid");
          err.statusCode = 400;
          return next(err);
        }

        if (session.metadata && session.metadata.orderId) {
          if (session.metadata.orderId !== order._id.toString()) {
            const err = new Error(
              "Checkout Session metadata does not match order id"
            );
            err.statusCode = 400;
            return next(err);
          }
        }

        const expectedAmount = Math.round(Number(order.totalPrice || 0) * 100);
        const actualAmount =
          typeof session.amount_total === "number" ? session.amount_total : 0;
        // Allow for small rounding differences (within 2 cents)
        const amountDifference = Math.abs(actualAmount - expectedAmount);
        if (amountDifference > 2) {
          console.error("Amount mismatch:", {
            expectedAmount,
            actualAmount,
            orderId: order._id.toString(),
            sessionId,
          });
          const err = new Error(
            `Checkout amount does not match order total. Expected: ${expectedAmount}, Got: ${actualAmount}`
          );
          err.statusCode = 400;
          return next(err);
        }

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
        order.stripeCheckoutSessionId = sessionId;

        // If payment_intent is expanded, extract charge/receipt
        const paymentIntent = session.payment_intent;
        if (
          paymentIntent &&
          paymentIntent.charges &&
          Array.isArray(paymentIntent.charges.data) &&
          paymentIntent.charges.data.length > 0
        ) {
          const charge = paymentIntent.charges.data[0];
          order.stripeChargeId = charge.id || order.stripeChargeId;
          order.stripeReceiptUrl = charge.receipt_url || order.stripeReceiptUrl;
        }

        order.paymentResult = { id: sessionId, status: session.payment_status };

        await order.save();
        console.log("Order marked as paid successfully:", {
          orderId: order._id.toString(),
          paymentStatus: order.paymentStatus,
        });

        const updated = await Order.findById(order._id);
        return res.json(updated);
      } catch (err) {
        console.error("Error updating order to paid:", err);
        return next(err);
      }
    } else if (isAdmin) {
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

      if (req.body.sessionId) {
        order.paymentResult = { id: req.body.sessionId, status: "paid" };
        order.stripeCheckoutSessionId = req.body.sessionId;
      }

      const updated = await order.save();
      return res.json(updated);
    } else {
      const err = new Error("sessionId is required to mark order paid");
      err.statusCode = 400;
      return next(err);
    }
  } catch (error) {
    console.error("updateOrderToPaid error:", error);
    next(error);
  }
};

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

export const cancelUnpaidOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    const isOwner = order.user.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    if (order.isPaid) {
      const err = new Error("Cannot cancel a paid order");
      err.statusCode = 400;
      return next(err);
    }

    if (order.stockReserved && !order.isPaid) {
      await adjustStock(order.orderItems, true);
    }

    await order.deleteOne();
    res.json({ message: "Order canceled" });
  } catch (error) {
    next(error);
  }
};
