import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const authenticatedUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.access_token;
  if (!token) {
    return responseHandler(
      res,
      401,
      "User is not authenticated or no token available",
    );
  }
  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    if (!decode) {
      return responseHandler(res, 401, "Not Authorized, User Not Found");
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    return responseHandler(
      res,
      500,
      "Not Authorized, Token Not valid or expired",
    );
  }
};
