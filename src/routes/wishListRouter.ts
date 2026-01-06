import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as WishListControllers from "../controllers/wishListControllers";
const router = Router();

router.post("/add", authenticatedUser, WishListControllers.addToWishList);
router.get(
  "/:userId",
  authenticatedUser,
  WishListControllers.getWishListByUser
);
router.delete(
  "/remove/:productId",
  authenticatedUser,
  WishListControllers.removeFromWishList
);

export default router;
