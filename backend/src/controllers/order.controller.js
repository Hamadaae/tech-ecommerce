import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";

async function adjustStock(items, session = null, increment = false) {
  for (const item of items) {
    const op = increment
      ? { $inc: { quantity: item.quantity } }
      : { $inc: { quantity: -item.quantity } };

    if (!increment) {
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
      await Product.updateOne({ _id: item.product }, op, { session });
    }
  }
}

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      totalPrice,
      stripePaymentIntentId = null,
      isPaid = false,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      const err = new Error("No order items");
      err.statusCode = 400;
      return next(err);
    }

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

    if (
      paymentMethod === "cash_on_delivery" ||
      paymentMethod === "cash_on_delivery".toLowerCase()
    ) {
      await adjustStock(orderItems, session, false);
      stockReserved = true;
    } else if (paymentMethod == "stripe") {
      if (isPaid) {
        await adjustStock(orderItems, session, false);
        stockReserved = true;
        orderDoc.paymentStatus = "paid";
        orderDoc.isPaid = true;
        orderDoc.paidAt = new Date();
      } else {
        orderDoc.paymentStatus = "pending";
      }
    } else {
      orderDoc.paymentStatus = "pending";
    }

    orderDoc.stockReserved = stockReserved;

    const [createdOrder] = await Order.create([orderDoc], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};


export const getMyOrders = async (req,res,next) => {
    try{
        if(!req.user || !req.user.id){
            const err = new Error('Authentication required');
            err.statusCode = 401;
            return next(err);
        }
        const orders = await Order.find({user : req.user.id}).sort({createdAt : -1});
        return res.json(orders);
    } catch(error){
        error.statusCode = error.statusCode || 500;
        return next(error);
    }
}

export const getOrderById = async (req,res,next) => {
    try{
        if(!req.user || !req.user.id){
            const err = new Error('Authentication required');
            err.statusCode = 401;
            return next(err);
        }
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if(!order){
            const err = new Error('Order not found');
            err.statusCode = 404;
            return next(err);
        }
        
        const isOwner = order.user._id.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';
        if(!isOwner && !isAdmin){
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            return next(err);
        }
        return res.json(order);
    } catch(error){
        return next(error);
    }
}

export const getAllOrders = async (req,res,next) => {
    try{
        if(!req.user || req.user.role !== 'admin'){
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            return next(err);
        }
        
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {}
        if(req.query.user){
            filter.user = req.query.user;
        }
        if(req.query.paymentStatus){
            filter.paymentStatus = req.query.paymentStatus;
        }
        if(req.query.paymentMethod){
            filter.paymentMethod = req.query.paymentMethod;
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
                    .populate('user', 'name email')
                    .sort({createdAt : -1})
                    .skip(skip)
                    .limit(limit);

        return res.json({
            data : orders,
            meta : {
                page,
                limit,
                total,
                pages : Math.ceil(total / limit),
                orders
            }
        });

    } catch(error){
        return next(error);
    }
}

export const updateOrderStatus = async (req,res,next) => {
    try{
        if(!req.user || req.user.role !== 'admin'){
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            return next(err);
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            const err = new Error('Order not found');
            err.statusCode = 404;
            return next(err);
        }
        const { status, isDelivered } = req.body;

        if(typeof status !== 'undefined'){
            order.status = status;
        }

        if(isDelivered == true && !order.isDelivered){
            order.isDelivered = true;
            order.deliveredAt = new Date();
        } else if(isDelivered == false && order.isDelivered){
            order.isDelivered = false;
            order.deliveredAt = undefined;
        }

        const updated = await order.save();
        return res.json(updated);

    } catch(error){
        return next(error);
    }
}

export const updateOrderToPaid = async (req,res,next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        if(!req.user || !req.user.id){
            const err = new Error('Authentication required');
            err.statusCode = 401;
            return next(err);
        }
        const order = await Order.findById(req.params.id).session(session);
        if(!order){
            const err = new Error('Order not found');
            err.statusCode = 404;
            return next(err);
        }

        const isOwner = order.user._id.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';

        if(!isOwner && !isAdmin){
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            return next(err);
        }

        if(order.isPaid){
            await session.commitTransaction()
            session.endSession();
            return res.json(order);
        }

        if(!order.stockReserved){
            await adjustStock(order.orderItems, session, false);
            order.stockReserved = true;
        }

        order.isPaid = true;
        order.paymentStatus = 'paid';
        order.paidAt = new Date();

        if(req.body.paymentResult){
            order.paymentResult = req.body.paymentResult;
            if(req.body.paymentResult.id){
                order.stripePaymentIntentId = req.body.paymentResult.id;
            }
        }

        const updated = await order.save({session});
        await session.commitTransaction();
        session.endSession();

        res.json(updated);
    } catch(error){
        await session.abortTransaction();
        session.endSession();
        return next(error);
    }
}


export const deleteOrder = async (req,res,next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        if(!req.user || req.user.role !== 'admin'){
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            return next(err);
        }
        const order = await Order.findById(req.params.id).session(session);
        if(!order){
            const err = new Error('Order not found');
            err.statusCode = 404;
            return next(err);
        }
        
        if(order.stockReserved && !order.isPaid){
            await adjustStock(order.orderItems, session, true);
        }

        await order.deleteOne({session});
        await session.commitTransaction();
        session.endSession();

        res.json({message : 'Order deleted successfully'});

    } catch(error){
        await session.abortTransaction();
        session.endSession();
        return next(error);
    }
}