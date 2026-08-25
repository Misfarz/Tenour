import { Router } from "express";
import { AuthController } from "../../../modules/auth/auth.controller";
import { VendorController } from "../../../modules/vendors/vendor.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

// Day 3 Buyer User Invitation Routes
router.get("/invitations/verify", AuthController.verifyInvitation);
router.post("/accept-invitation", AuthController.acceptInvitation);

// Day 6 Vendor Authentication Routes
router.post("/vendor/accept-invitation", VendorController.acceptVendorInvitation);
router.post("/vendor/login", VendorController.vendorLogin);

export default router;
