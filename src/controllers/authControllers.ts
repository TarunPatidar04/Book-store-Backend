import { Request, Response } from "express";
import UserModel from "../models/User.model";
import { responseHandler } from "../utils/responseHandler";
import crypto from "crypto";
import { sendVerificationEmail } from "../config/emailConfig";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, agreeTerms } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return responseHandler(res, 400, "User already exists");
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const user = new UserModel({
      name,
      email,
      password,
      agreeTerms,
      verificationToken,
    });
    await user.save();
    // console.log("verificationToken", verificationToken);
    const result = await sendVerificationEmail(user.email, verificationToken);
    // console.log("result : ", result);

    return responseHandler(
      res,
      201,
      "User registered successfully, Please check your email for verification"
    );
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.params;

    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
      return responseHandler(res, 400, "Invalid verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    const accessToken = generateToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await user.save();
    return responseHandler(res, 200, "Email verified successfully");
  } catch (error) {
    console.log(error);
    return responseHandler(res, 500, "Internal server error");
  }
};
