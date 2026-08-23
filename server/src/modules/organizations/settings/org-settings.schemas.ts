import { z } from "zod";

export const updateOrgSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;
