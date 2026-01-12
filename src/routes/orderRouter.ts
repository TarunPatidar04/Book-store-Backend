import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as OrderController from "../controllers/orderControllers";
const router = Router();

router.post("/", authenticatedUser, OrderController.createOrUpdateOrder);
router.get("/", authenticatedUser, OrderController.getOrderByUser);
router.get("/:id", authenticatedUser, OrderController.getOrderById);

export default router;
