import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
