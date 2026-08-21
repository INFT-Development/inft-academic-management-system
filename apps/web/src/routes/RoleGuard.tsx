import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import {Role} from "@/constants/roles";
interface RoleGuardProps {
  allowedRoles: Role[];
}

export function RoleGuard({
  allowedRoles,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}