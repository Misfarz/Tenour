import { Router } from "express";
import { AuthController } from "../../../modules/auth/auth.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

// Day 3 User Invitation Routes
router.get("/invitations/verify", AuthController.verifyInvitation);
router.post("/accept-invitation", AuthController.acceptInvitation);

export default router;
