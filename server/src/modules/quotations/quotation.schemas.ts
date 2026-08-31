import { z } from "zod";

export const createQuotationItemSchema = z.object({
  rfqItemId: z.string().min(1, "RFQ Item ID is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  tax: z.number().min(0, "Tax cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export const createQuotationSchema = z.object({
  rfqId: z.string().min(1, "RFQ ID is required"),
  currency: z.string().default("INR"),
  deliveryDays: z.number().int().min(0, "Delivery days must be non-negative").optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(createQuotationItemSchema).min(1, "At least one item quotation is required"),
});

export const updateQuotationItemSchema = z.object({
  id: z.string().optional(),
  rfqItemId: z.string().min(1, "RFQ Item ID is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  tax: z.number().min(0, "Tax cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export const updateQuotationSchema = z.object({
  currency: z.string().optional(),
  deliveryDays: z.number().int().min(0).optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(updateQuotationItemSchema).optional(),
});

export const selectQuotationSchema = z.object({
  notes: z.string().optional().nullable(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type SelectQuotationInput = z.infer<typeof selectQuotationSchema>;
