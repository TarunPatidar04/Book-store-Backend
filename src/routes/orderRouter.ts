import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as OrderController from "../controllers/orderControllers";
const router = Router();

router.post("/", authenticatedUser, OrderController.createOrUpdateOrder);
router.get("/", authenticatedUser, OrderController.getOrderByUser);
router.get("/:id", authenticatedUser, OrderController.getOrderById);

router.post("/payment-razorpay", authenticatedUser, OrderController.createPaymentWithRazorpay);
router.post("/razorpay-webhook", authenticatedUser, OrderController.handleRazorPayWebhook);

export default router;
