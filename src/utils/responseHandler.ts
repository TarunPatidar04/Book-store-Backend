import { Response } from "express";

export const responseHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    sucess: statusCode >= 200 && statusCode < 300,
    message,
    data: data || null,
  });
};
