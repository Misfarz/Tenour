import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  quotationId: z.string().min(1, "Quotation ID is required"),
  deliveryAddress: z.string().optional().nullable(),
  deliveryDeadline: z.string().datetime().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePurchaseOrderSchema = z.object({
  deliveryAddress: z.string().optional().nullable(),
  deliveryDeadline: z.string().datetime().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const rejectPurchaseOrderSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const cancelPurchaseOrderSchema = z.object({
  cancelReason: z.string().min(1, "Cancellation reason is required"),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type RejectPurchaseOrderInput = z.infer<typeof rejectPurchaseOrderSchema>;
export type CancelPurchaseOrderInput = z.infer<typeof cancelPurchaseOrderSchema>;
