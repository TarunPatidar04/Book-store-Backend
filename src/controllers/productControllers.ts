import { Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import { uploadToCloudinary } from "../config/cloudnaryConfig";
import Product from "../models/Product";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      category,
      condition,
      classType,
      price,
      author,
      edition,
      description,
      finalPrice,
      shippingCharge,
      seller,
      paymentMode,
      paymentDetails,
    } = req.body;
    const sellerId = req.id;

    const images = req.files as Express.Multer.File[];
    console.log("images", images);
    if (!images || images.length == 0) {
      return responseHandler(res, 400, "Please upload at least one image");
    }

    let parsedPaymentsDetails = JSON.parse(paymentDetails);
    if (
      (paymentMode == "UPI" && !parsedPaymentsDetails) ||
      !parsedPaymentsDetails.upiId
    ) {
      return responseHandler(
        res,
        400,
        "UPI ID is Required ||Invalid Payment Details"
      );
    }

    if (
      paymentMode === "Bank Account" &&
      (!parsedPaymentsDetails ||
        !parsedPaymentsDetails.bankDetails ||
        !parsedPaymentsDetails.bankDetails.accountNumber ||
        !parsedPaymentsDetails.bankDetails.ifscCode ||
        !parsedPaymentsDetails.bankDetails.bankName)
    ) {
      return responseHandler(
        res,
        400,
        "Bank Details are Required ||Invalid Payment Details"
      );
    }
    const uploadPromise = images.map((file) => uploadToCloudinary(file as any));
    const uploadImages = await Promise.all(uploadPromise);
    const imageUrl = uploadImages.map((image) => image.secure_url);
    console.log("imageUrl", imageUrl);

    const product = new Product({
      title,
      images: imageUrl,
      subject,
      category,
      condition,
      classType,
      price,
      author,
      edition,
      description,
      finalPrice,
      shippingCharge,
      paymentMode,
      seller: sellerId,
      paymentDetails: parsedPaymentsDetails,
    });

    await product.save();
    return responseHandler(
      res,
      200,
      "Product created Successfully...",
      product
    );
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("seller", "name email");

    return responseHandler(
      res,
      200,
      "Products fetched Successfully...",
      products
    );
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};
