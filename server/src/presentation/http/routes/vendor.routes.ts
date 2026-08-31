import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { VendorController } from "../../../modules/vendors/vendor.controller";

const router = Router();

// Public Vendor Invitation, Registration & Login Endpoints
router.post("/accept-invitation", VendorController.acceptVendorInvitation);
router.get("/invitation/:token", VendorController.getVendorInvitationByToken);
router.post("/login", VendorController.vendorLogin);
router.post("/register", VendorController.registerVendor);
router.post("/auth/register", VendorController.registerVendor);

// Protected Buyer Vendor Endpoints
router.use(authenticate, tenantContext);

// List & Create
router.get("/", VendorController.getVendors);
router.post(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.createVendor
);

// Detail & Edit
router.get("/:id", VendorController.getVendorById);
router.patch(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.updateVendor
);
router.patch(
  "/:id/status",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.updateVendorStatus
);

// Contacts
router.get("/:id/contacts", VendorController.getContacts);
router.post(
  "/:id/contacts",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.addContact
);
router.patch(
  "/:id/contacts/:contactId",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.updateContact
);
router.delete(
  "/:id/contacts/:contactId",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.deleteContact
);

// Invitations
router.post(
  "/:id/invite",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.inviteVendor
);

export default router;
