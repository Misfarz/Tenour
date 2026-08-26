import { z } from "zod";

export const rfqItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unit: z.string().optional().default("PCS"),
  specifications: z.string().optional(),
});

export const createRfqSchema = z.object({
  purchaseRequestId: z.string().uuid("Invalid Purchase Request ID"),
  title: z.string().min(1, "RFQ title is required"),
  description: z.string().optional(),
  quotationDeadline: z.string().or(z.date()).transform((val) => new Date(val)),
  deliveryRequirement: z.string().optional(),
  items: z.array(rfqItemSchema).min(1, "RFQ must contain at least one item"),
  vendorIds: z.array(z.string().uuid("Invalid vendor ID")).optional().default([]),
});

export const updateRfqSchema = z.object({
  title: z.string().min(1, "RFQ title is required").optional(),
  description: z.string().optional(),
  quotationDeadline: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  deliveryRequirement: z.string().optional(),
  items: z.array(rfqItemSchema).optional(),
  vendorIds: z.array(z.string().uuid("Invalid vendor ID")).optional(),
});

export const updateRfqStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "OPEN", "CLOSED", "CANCELLED"]),
});

export type CreateRfqInput = z.infer<typeof createRfqSchema>;
export type UpdateRfqInput = z.infer<typeof updateRfqSchema>;
export type UpdateRfqStatusInput = z.infer<typeof updateRfqStatusSchema>;
