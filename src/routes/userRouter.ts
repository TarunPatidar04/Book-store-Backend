import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as userController from "../controllers/userControllers";
const router = Router();

router.put(
  "/profile/update/:userId",
  authenticatedUser,
  userController.updateUserProfile
);

export default router;
