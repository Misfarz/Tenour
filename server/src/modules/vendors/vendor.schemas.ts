import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required"),
  legalName: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
