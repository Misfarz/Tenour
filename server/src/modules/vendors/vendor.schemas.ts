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

export const updateVendorSchema = createVendorSchema.partial();

export const updateVendorStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

export const vendorContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  designation: z.string().trim().optional(),
});

export const inviteVendorSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  name: z.string().trim().min(1, "Contact name is required"),
});

export const acceptVendorInvitationSchema = z.object({
  token: z.string().trim().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const vendorLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerVendorSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: z.string().trim().min(1, "Contact person name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type UpdateVendorStatusInput = z.infer<typeof updateVendorStatusSchema>;
export type VendorContactInput = z.infer<typeof vendorContactSchema>;
export type InviteVendorInput = z.infer<typeof inviteVendorSchema>;
export type AcceptVendorInvitationInput = z.infer<typeof acceptVendorInvitationSchema>;
export type VendorLoginInput = z.infer<typeof vendorLoginSchema>;
export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;
