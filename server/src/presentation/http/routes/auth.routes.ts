import { Router } from "express";
import { AuthController } from "../../../modules/auth/auth.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
