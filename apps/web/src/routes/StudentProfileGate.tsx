import { Navigate, Outlet } from "react-router-dom";

import { useOrganization } from "@/hooks/useOrganization";

/**
 * Sits below RoleGuard(STUDENT). Sends a student who hasn't linked or
 * created their academic-details record in the current organization to the
 * completion flow before letting them into the rest of the student dashboard.
 */
export function StudentProfileGate() {
  const { currentMembership } = useOrganization();

  if (currentMembership && currentMembership.profileComplete === false) {
    return <Navigate to="/dashboard/student/complete-profile" replace />;
  }

  return <Outlet />;
}
