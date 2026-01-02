import { Router } from "express";
import * as authController from "../controllers/authControllers";

const router = Router();

router.post("/register", authController.register);

export default router;
