import { NextFunction, Request, Response, Router } from "express";
import * as authController from "../controllers/authControllers";
import { authenticatedUser } from "../middleware/authMiddleware";
import passport from "passport";
import { IUser } from "../models/User.model";
import { generateToken } from "../utils/generateToken";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/logout", authController.logout);
router.get("/verify-auth", authenticatedUser, authController.checkUserAuth);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}`,
    session: false,
  }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser;
      const accessToken = await generateToken(user);
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
