import { z } from "zod";
import { GRANTABLE_ROLES, REASSIGNABLE_ROLES } from "../role";

export const createOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Organization name must be at least 2 characters" })
      .max(100, { message: "Organization name must be under 100 characters" }),
  })
  .strict();

export const addMemberSchema = z
  .object({
    email: z.email({ message: "Invalid email address" }),
    role: z.enum(GRANTABLE_ROLES, {
      message: "Role must be ADMIN or TEACHER",
    }),
  })
  .strict();

export const updateMemberRoleSchema = z
  .object({
    role: z.enum(REASSIGNABLE_ROLES, {
      message: "Role must be ADMIN, TEACHER, or STUDENT",
    }),
  })
  .strict();

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
