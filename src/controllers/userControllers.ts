import { Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import UserModel from "../models/User.model";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return responseHandler(res, 400, "User Id is required");
    }
    const { name, email, phonenumber } = req.body;

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, email, phonenumber },
      { new: true, runValidators: true }
    ).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpire"
    );

    if (!updateUser) {
      return responseHandler(res, 400, "User not found");
    }

    return responseHandler(
      res,
      200,
      "User Profile updated successfully",
      updateUser
    );
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};



