import { Request, Response } from "express";
import UserModel from "../models/User.model";
import { responseHandler } from "../utils/responseHandler";
import crypto from "crypto";
import {
  sendResetPasswordLinkToEmail,
  sendVerificationEmail,
} from "../config/emailConfig";
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
      "User registered successfully, Please check your email for verification",
    );
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
      return responseHandler(res, 400, "Invalid verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    const accessToken = generateToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await user.save();
    return responseHandler(res, 200, "Email verified successfully", {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return responseHandler(res, 400, "Invalid email or password");
    }

    if (!user.isVerified) {
      return responseHandler(res, 400, "Please verify your email");
    }

    const accessToken = generateToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return responseHandler(res, 200, "Login successfully", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      accessToken,
    });
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return responseHandler(res, 400, "User not found");
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000);
    await user.save();
    const result = await sendResetPasswordLinkToEmail(
      user.email,
      resetPasswordToken,
    );

    return responseHandler(res, 200, "Reset password link sent successfully");
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return responseHandler(
        res,
        400,
        "Invalid or Expired reset password token",
      );
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return responseHandler(res, 200, "Password reset successfully");
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return responseHandler(res, 200, "Logout successfully");
  } catch (error) {
    return responseHandler(res, 500, "Internal server error");
  }
};

export const checkUserAuth = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    if (!userId) {
      return responseHandler(
        res,
        400,
        "unAuthenciated, please login to access our data",
      );
    }

    const user = await UserModel.findById(userId).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpire",
    );

    if (!user) {
      return responseHandler(res, 403, "User not found");
    }

    return responseHandler(
      res,
      200,
      "User Authenticated(retrived) successfully",
      user,
    );
  } catch (error) {
    return responseHandler(
      res,
      500,
      "Not Authorized, Token Not valid or expired",
    );
  }
};
