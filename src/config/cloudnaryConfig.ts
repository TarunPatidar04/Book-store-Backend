import multer from "multer";
import fs from "fs";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import { RequestHandler } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

interface CustomFile extends Express.Multer.File {
  path: string;
}

const uploadToCloudinary = (file: CustomFile): Promise<UploadApiResponse> => {
  const options: UploadApiOptions = {
    resource_type: "image",
  };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, options, (error, result) => {
      if (error) {
        fs.unlink(file.path, (unlinkError) => {
          if (unlinkError)
            console.error(
              "Error deleting local file after failed upload:",
              unlinkError,
            );
        });
        return reject(error);
      }
      fs.unlink(file.path, (unlinkError) => {
        if (unlinkError)
          console.error(
            "Error deleting local file after successful upload:",
            unlinkError,
          );
      });
      resolve(result as UploadApiResponse);
    });
  });
};

const multerMiddleware: RequestHandler = multer({ dest: "uploads/" }).array(
  "images",
  4,
);

export { multerMiddleware, uploadToCloudinary };
