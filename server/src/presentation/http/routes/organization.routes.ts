import { Router } from "express";
import { OrganizationController } from "../../../modules/organizations/organization.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, OrganizationController.createOrganization);

export default router;
