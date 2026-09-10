import { Navigate } from "react-router-dom";

import { useOrganization } from "@/hooks/useOrganization";
import { Role } from "@/constants/roles";

export function DashboardRedirect() {
  const { currentMembership } = useOrganization();

  if (!currentMembership) {
    return <Navigate to="/dashboard" replace />;
  }

  switch (currentMembership.role) {
    case Role.SUPER_ADMIN:
      return <Navigate to="/dashboard/super-admin" replace />;

    case Role.ADMIN:
      return <Navigate to="/dashboard/admin" replace />;

    case Role.TEACHER:
      return <Navigate to="/dashboard/teacher" replace />;

    case Role.STUDENT:
      return <Navigate to="/dashboard/student" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}
