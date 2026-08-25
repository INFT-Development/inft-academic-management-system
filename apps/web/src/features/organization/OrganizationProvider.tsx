import { useEffect, useState, type ReactNode } from "react";

import { OrganizationContext } from "@/hooks/organization-context";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "selectedOrganizationId";

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { memberships, refreshMemberships } = useAuth();

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(() => localStorage.getItem(STORAGE_KEY));

  // Keep the selection valid as memberships change (join/leave/promote,
  // or a fresh login) — this is a UI convenience only, never an
  // authorization source. The backend re-checks membership on every request.
  useEffect(() => {
    if (memberships.length === 0) {
      if (selectedOrganizationId !== null) {
        setSelectedOrganizationId(null);
      }
      return;
    }

    const stillValid = memberships.some(
      (m) => m.organizationId === selectedOrganizationId,
    );

    if (!stillValid) {
      const next =
        memberships.length === 1 ? memberships[0].organizationId : null;
      setSelectedOrganizationId(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships]);

  function selectOrganization(organizationId: string) {
    localStorage.setItem(STORAGE_KEY, organizationId);
    setSelectedOrganizationId(organizationId);
  }

  useEffect(() => {
    if (selectedOrganizationId) {
      localStorage.setItem(STORAGE_KEY, selectedOrganizationId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedOrganizationId]);

  const currentMembership =
    memberships.find((m) => m.organizationId === selectedOrganizationId) ??
    null;

  return (
    <OrganizationContext.Provider
      value={{
        memberships,
        currentMembership,
        selectOrganization,
        refreshMemberships,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}
