import { Router } from "express";
import * as authController from "../controllers/authControllers";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email/:token", authController.verifyEmail);

export default router;
