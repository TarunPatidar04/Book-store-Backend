import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import { multerMiddleware } from "../config/cloudnaryConfig";
import * as ProductController from "../controllers/productControllers";
const router = Router();

router.post(
  "/",
  authenticatedUser,
  multerMiddleware,
  ProductController.createProduct,
);

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.get("/seller/:sellerId", ProductController.getProductBySellerId);
router.delete(
  "/seller/:productId",
  authenticatedUser,
  ProductController.deleteProduct,
);

export default router;
