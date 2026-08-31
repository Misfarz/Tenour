import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext, vendorContext } from "../../../shared/middleware/tenant.middleware";
import { NotificationRepository } from "../../../modules/notifications/notification.repository";

const router = Router();
const repo = new NotificationRepository();

// GET /notifications/buyer - List notifications for buyer user
router.get("/buyer", authenticate, tenantContext, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const organizationId = req.tenant?.organizationId || req.organization?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [notifications, unreadCount] = await Promise.all([
      repo.findForBuyerUser(userId, organizationId),
      repo.countUnreadForBuyerUser(userId, organizationId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /notifications/vendor - List notifications for vendor user
router.get("/vendor", authenticate, vendorContext, async (req: any, res: any) => {
  try {
    const vendorId = req.vendorContext?.vendorId || req.vendorUser?.vendorId || req.user?.vendorId;
    const userId = req.user?.userId || req.user?.id;

    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized vendor user" });
    }

    const [notifications, unreadCount] = await Promise.all([
      repo.findForVendor(vendorId, userId),
      repo.countUnreadForVendor(vendorId, userId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /notifications/:id/read - Mark a notification as read
router.patch("/:id/read", authenticate, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const updated = await repo.markAsRead(id);
    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /notifications/buyer/mark-all-read - Mark all buyer notifications as read
router.patch("/buyer/mark-all-read", authenticate, tenantContext, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const organizationId = req.tenant?.organizationId || req.organization?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await repo.markAllAsReadForBuyer(userId, organizationId);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /notifications/vendor/mark-all-read - Mark all vendor notifications as read
router.patch("/vendor/mark-all-read", authenticate, vendorContext, async (req: any, res: any) => {
  try {
    const vendorId = req.vendorContext?.vendorId || req.vendorUser?.vendorId || req.user?.vendorId;
    const userId = req.user?.userId || req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized vendor user" });
    }

    await repo.markAllAsReadForVendor(vendorId, userId);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
