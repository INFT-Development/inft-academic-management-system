export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = Object.values(Role) as Role[];

/** Roles that can be granted to an existing user by an org admin (see POST /organizations/:id/members). */
export const GRANTABLE_ROLES = [Role.ADMIN, Role.TEACHER] as const;

/** Roles an org's SUPER_ADMIN can reassign a member to (see PATCH .../members/:id). SUPER_ADMIN itself is not reassignable — one per organization, set only at creation. */
export const REASSIGNABLE_ROLES = [Role.ADMIN, Role.TEACHER, Role.STUDENT] as const;
