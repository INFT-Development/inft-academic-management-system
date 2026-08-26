import type { User } from "@supabase/supabase-js";
import type { Role } from "@ams/shared";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type RequestMembership = {
  id: string;
  organizationId: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      membership?: RequestMembership;
    }
  }
}

export {};
