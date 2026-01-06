import { Request, Response } from "express";
import Products from "../models/Product";
import { responseHandler } from "../utils/responseHandler";
import { CartItems, ICartItem } from "../models/CartItems";
import { WishList } from "../models/WishList.model";

export const addToWishList = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const userId = req.id;

    const product = await Products.findById(productId);

    if (!product) {
      return responseHandler(res, 404, "Product not found");
    }

    let wishList = await WishList.findOne({ user: userId });
    if (!wishList) {
      wishList = new WishList({ user: userId, products: [] });
    }
    if (!wishList.products.includes(productId)) {
      wishList.products.push(productId);
      await wishList.save();
    }
    return responseHandler(res, 200, "Product added to wishlist", wishList);
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const removeFromWishList = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.id;

    let wishList = await WishList.findOne({ user: userId });
    if (!wishList) {
      return responseHandler(res, 404, "WishList not found for this User");
    }

    wishList.products = wishList.products.filter(
      (id) => id.toString() !== productId
    );
    await wishList.save();
    return responseHandler(res, 200, "Product removed from wishlist");
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const getWishListByUser = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;

    let wishList = await WishList.findOne({ user: userId }).populate(
      "products"
    );

    if (!wishList) {
      return responseHandler(res, 404, "WishList is Empty", { products: [] });
    }
    await wishList.save();
    return responseHandler(
      res,
      200,
      "User WishList get successfully",
      wishList
    );
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};
