import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { multerMiddleware } from "../config/cloudnaryConfig";
import * as ProductController from "../controllers/productControllers";
const router = Router();

router.post(
  "/",
  authenticatedUser,
  multerMiddleware,
  ProductController.createProduct
);

export default router;
