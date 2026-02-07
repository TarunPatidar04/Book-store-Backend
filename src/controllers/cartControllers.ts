import { Request, Response } from "express";
import Products from "../models/Product";
import { responseHandler } from "../utils/responseHandler";
import { CartItems, ICartItem } from "../models/CartItems";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.id;

    const product = await Products.findById(productId);

    if (!product) {
      return responseHandler(res, 404, "Product not found");
    }

    if (product.seller.toString() === userId) {
      return responseHandler(
        res,
        400,
        "You cannot add your own product to the cart",
      );
    }

    let cart = await CartItems.findOne({ user: userId });
    if (!cart) {
      cart = new CartItems({ user: userId, items: [] });
    }
    const existingItems = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItems) {
      existingItems.quantity += quantity;
    } else {
      const newItem = { product: productId, quantity: quantity };
      cart.items.push(newItem as ICartItem);
    }
    await cart.save();
    return responseHandler(res, 200, "Product added to cart", cart);
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.id;

    let cart = await CartItems.findOne({ user: userId });
    if (!cart) {
      return responseHandler(res, 404, "Cart not found for this User");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await cart.save();
    return responseHandler(res, 200, "Product removed from cart");
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const getCartByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    let cart = await CartItems.findOne({ user: userId }).populate(
      "items.product",
    );
    if (!cart) {
      return responseHandler(res, 404, "Cart is Empty", { items: [] });
    }
    return responseHandler(res, 200, "User Cart get successfully", cart);
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error");
  }
};
