import { z } from "zod";

export const purchaseRequestItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().int("Quantity must be a whole number").gt(0, "Quantity must be greater than 0"),
  estimatedUnitPrice: z.number().min(0, "Estimated unit price cannot be negative"),
});

export const createPurchaseRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  justification: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  items: z.array(purchaseRequestItemSchema).min(1, "At least one item is required"),
});

export const updatePurchaseRequestSchema = createPurchaseRequestSchema;

export const rejectPurchaseRequestSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required"),
});

export type CreatePurchaseRequestInput = z.infer<typeof createPurchaseRequestSchema>;
export type UpdatePurchaseRequestInput = z.infer<typeof updatePurchaseRequestSchema>;
export type PurchaseRequestItemInput = z.infer<typeof purchaseRequestItemSchema>;
export type RejectPurchaseRequestInput = z.infer<typeof rejectPurchaseRequestSchema>;
