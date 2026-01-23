import { Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import { CartItems } from "../models/CartItems";
import orderModel from "../models/order.model";
// import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID as string,
//   key_secret: process.env.RAZORPAY_KEY_SECRET as string,
// });

export const createOrUpdateOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const {
      orderId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentDetails,
    } = req.body;

    const cart = await CartItems.findOne({ user: userId }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return responseHandler(res, 400, "Cart is Empty");
    }

    let order = await orderModel.findOne({ _id: orderId });
    if (order) {
      order.shippingAddress = shippingAddress || order.shippingAddress;
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.totalAmount = totalAmount || order.totalAmount;
      if (paymentDetails) {
        order.paymentDetails = paymentDetails;
        order.paymentStatus = "completed";
        order.status = "processing";
      }
      await order.save();
      return responseHandler(res, 200, "Order updated Successfully...", order);
    } else {
      order = new orderModel({
        user: userId,
        shippingAddress,
        paymentMethod,
        totalAmount,
        paymentDetails,
        paymentStatus: paymentDetails ? "completed" : "pending",
        items: cart.items,
      });
      await order.save();
      if (paymentDetails) {
        await CartItems.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } },
        );
      }
      return responseHandler(res, 200, "Order created Successfully...", order);
    }
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        model: "Product",
      });
    if (!order) {
      return responseHandler(res, 404, "Order not found");
    }
    return responseHandler(
      res,
      200,
      "Order fetched by Id Successfully...",
      order,
    );
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const getOrderByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    const order = await orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!order) {
      return responseHandler(res, 400, "Order not found");
    }

    return responseHandler(res, 200, "User Order get successfully", order);
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const createPaymentWithRazorpay = async (
  req: Request,
  res: Response,
) => {
  return responseHandler(res, 503, "Razorpay is temporarily disabled");
  // try {
  //   const orderId = req.body;
  //   const order = await orderModel.findById(orderId);

  //   if (!order) {
  //     return responseHandler(res, 400, "Order not found");
  //   }

  //   const razorPayOrder = await razorpay.orders.create({
  //     amount: Math.round(order.totalAmount * 100),
  //     currency: "INR",
  //     receipt: order?._id.toString(),
  //   });

  //   return responseHandler(
  //     res,
  //     200,
  //     "RazorPay Order and Payment created successfully",
  //     { order: razorPayOrder }
  //   );
  // } catch (error) {
  //   return responseHandler(res, 500, "Internal server error");
  // }
};

export const handleRazorPayWebhook = async (req: Request, res: Response) => {
  return responseHandler(res, 503, "Razorpay is temporarily disabled");
  // try {
  //   const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

  //   const shasum = crypto.createHmac("sha256", secret);
  //   shasum.update(JSON.stringify(req.body));
  //   const digest = shasum.digest("hex");

  //   if (digest === req.headers["x-razorpay-signature"]) {
  //     const paymentId = req.body.payload.payment.entity.id;
  //     const orderId = req.body.payload.payment.entity.order.id;

  //     await orderModel.findOneAndUpdate(
  //       { "paymentDetails.razorpay_order_id": orderId },
  //       {
  //         paymentStatus: "completed",
  //         status: "processing",
  //         "paymentDetails.razorpay_payment_id": paymentId,
  //       }
  //     );
  //     return responseHandler(
  //       res,
  //       200,
  //       "Webhook Process || Payment completed successfully"
  //     );
  //   } else {
  //     return responseHandler(res, 400, "Invalid signature");
  //   }
  // } catch (error) {
  //   return responseHandler(res, 500, "Internal server error");
  // }
};
