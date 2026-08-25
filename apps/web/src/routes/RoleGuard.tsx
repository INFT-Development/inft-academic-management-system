import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@ams/shared";

import { useOrganization } from "@/hooks/useOrganization";
import { ForbiddenState } from "@/components/states";

interface RoleGuardProps {
  allowedRoles: Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { currentMembership } = useOrganization();

  if (!currentMembership) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!allowedRoles.includes(currentMembership.role)) {
    return <ForbiddenState />;
  }

  return <Outlet />;
}
