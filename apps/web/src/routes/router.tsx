import { Navigate, createBrowserRouter } from "react-router-dom";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { TeacherDashboardPage } from "@/features/teacher/pages/TeacherDashboardPage";
import { StudentDashboardPage } from "@/features/student/pages/StudentDashboardPage";

import { DashboardRedirect } from "./DashboardRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { Role } from "@/constants/roles";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardRedirect />,
      },

      {
        element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
        children: [
          {
            path: "/dashboard/admin",
            element: <AdminDashboardPage />,
          },
        ],
      },

      {
        element: <RoleGuard allowedRoles={[Role.TEACHER]} />,
        children: [
          {
            path: "/dashboard/teacher",
            element: <TeacherDashboardPage />,
          },
        ],
      },

      {
        element: <RoleGuard allowedRoles={[Role.STUDENT]} />,
        children: [
          {
            path: "/dashboard/student",
            element: <StudentDashboardPage />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);