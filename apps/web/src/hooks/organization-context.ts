import { createContext } from "react";
import type { MembershipSummary } from "@ams/shared";

export interface OrganizationContextValue {
  memberships: MembershipSummary[];
  currentMembership: MembershipSummary | null;
  selectOrganization: (organizationId: string) => void;
  refreshMemberships: () => Promise<void>;
}

export const OrganizationContext = createContext<
  OrganizationContextValue | undefined
>(undefined);
