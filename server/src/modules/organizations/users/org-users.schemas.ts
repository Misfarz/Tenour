import { z } from "zod";

const BUYER_ROLES = ["ORG_ADMIN", "EMPLOYEE", "MANAGER", "PROCUREMENT", "FINANCE"] as const;

export const addOrgUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(BUYER_ROLES),
  departmentId: z.string().nullable().optional(),
});

export const updateOrgUserRoleSchema = z.object({
  role: z.enum(BUYER_ROLES),
});

export const updateOrgUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type AddOrgUserInput = z.infer<typeof addOrgUserSchema>;
export type UpdateOrgUserRoleInput = z.infer<typeof updateOrgUserRoleSchema>;
export type UpdateOrgUserStatusInput = z.infer<typeof updateOrgUserStatusSchema>;
