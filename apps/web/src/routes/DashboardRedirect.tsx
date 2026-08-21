import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import {Role} from "@/constants/roles";

export function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
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