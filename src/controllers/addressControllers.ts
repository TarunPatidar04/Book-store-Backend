import { Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import UserModel from "../models/User.model";
import AddressModel from "../models/Address.model";

export const createOrUpdateByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const {
      addressLine1,
      addressLine2,
      phoneNumber,
      city,
      state,
      pinCode,
      addressId,
    } = req.body;

    if (!userId) {
      return responseHandler(res, 400, "User Id not found");
    }

    if (!addressLine1 || !phoneNumber || !state || !city || !pinCode) {
      return responseHandler(
        res,
        400,
        "Please Enter All Value to create new address",
      );
    }

    if (addressId) {
      const existingAddress = await AddressModel.findById(addressId);

      if (!existingAddress) {
        return responseHandler(res, 400, "Address not found");
      }
      existingAddress.addressLine1 = addressLine1;
      existingAddress.addressLine2 = addressLine2;
      existingAddress.phoneNumber = phoneNumber;
      existingAddress.city = city;
      existingAddress.state = state;
      existingAddress.pinCode = pinCode;
      await existingAddress.save();
      return responseHandler(
        res,
        200,
        "Address updated successfully",
        existingAddress,
      );
    } else {
      const newAddress = new AddressModel({
        user: userId,
        addressLine1,
        addressLine2,
        phoneNumber,
        city,
        state,
        pinCode: pinCode,
      });
      await newAddress.save();
      await UserModel.findByIdAndUpdate(
        userId,
        {
          $push: { addresses: newAddress._id },
        },
        { new: true },
      );
      return responseHandler(
        res,
        200,
        "Address created successfully",
        newAddress,
      );
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const getAllAddressByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) {
      return responseHandler(res, 400, "User Id not found in get Address");
    }
    const user = await UserModel.findById(userId).populate("addresses");
    if (!user) {
      return responseHandler(res, 400, "User not found in get Address");
    }
    return responseHandler(res, 200, "User Address get successfully", user);
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};
