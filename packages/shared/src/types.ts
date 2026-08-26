import type { Role } from "./role";

export interface User {
  id: string;
  email: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
}

/** One of the current user's org memberships, as returned by /auth/me, /auth/login, /auth/refresh. */
export interface MembershipSummary {
  id: string;
  organizationId: string;
  organizationName: string;
  role: Role;
}

/** A row in an organization's member list (Students / Teachers / Admins tables). */
export interface Member {
  id: string;
  role: Role;
  createdAt: string;
  user: User;
}

export interface AuthSession {
  user: User;
  memberships: MembershipSummary[];
  accessToken: string;
  refreshToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}
