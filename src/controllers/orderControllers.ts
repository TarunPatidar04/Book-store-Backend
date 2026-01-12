import { Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import { CartItems } from "../models/CartItems";
import orderModel from "../models/order.model";

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
      "items.product"
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
          { $set: { items: [] } }
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
      order
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

    console.log("order", order);

    if (!order) {
      return responseHandler(res, 400, "Order not found");
    }

    return responseHandler(res, 200, "User Order get successfully", order);
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};
