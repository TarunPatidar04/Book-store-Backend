import { Router } from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as AddressController from "../controllers/addressControllers";
const router = Router();

router.post("/create-or-update",authenticatedUser,AddressController.createOrUpdateByUserId
);

router.get("/", authenticatedUser, AddressController.getAllAddressByUserId);


export default router;
