import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/User.model";
dotenv.config();

export const generateToken = (user: IUser) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
