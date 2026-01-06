import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as CartControllers from "../controllers/cartControllers";
const router = Router();

router.post("/add", authenticatedUser, CartControllers.addToCart);
router.get("/:userId", authenticatedUser, CartControllers.getCartByUser);
router.delete(
  "/remove/:productId",
  authenticatedUser,
  CartControllers.removeFromCart
);

export default router;
