import { Navigate, createBrowserRouter } from "react-router-dom";
import { Role } from "@ams/shared";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { OnboardingPage } from "@/features/organization/pages/OnboardingPage";

import { SuperAdminDashboardPage } from "@/features/super-admin/pages/SuperAdminDashboardPage";
import { SuperAdminAdminsPage } from "@/features/super-admin/pages/SuperAdminAdminsPage";
import { SuperAdminTeachersPage } from "@/features/super-admin/pages/SuperAdminTeachersPage";
import { SuperAdminStudentsPage } from "@/features/super-admin/pages/SuperAdminStudentsPage";
import { SuperAdminStudentImportPage } from "@/features/super-admin/pages/SuperAdminStudentImportPage";
import { SuperAdminSettingsPage } from "@/features/super-admin/pages/SuperAdminSettingsPage";

import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminTeachersPage } from "@/features/admin/pages/AdminTeachersPage";
import { AdminStudentsPage } from "@/features/admin/pages/AdminStudentsPage";
import { AdminStudentImportPage } from "@/features/admin/pages/AdminStudentImportPage";

import { TeacherDashboardPage } from "@/features/teacher/pages/TeacherDashboardPage";

import { StudentDashboardPage } from "@/features/student/pages/StudentDashboardPage";
import { StudentProfilePage } from "@/features/student/pages/StudentProfilePage";
import { CompleteStudentProfilePage } from "@/features/student/pages/CompleteStudentProfilePage";

import { AppShell } from "@/components/layout/AppShell";
import { NotFoundState } from "@/components/states";

import { DashboardRedirect } from "./DashboardRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { OrganizationGate } from "./OrganizationGate";
import { RoleGuard } from "./RoleGuard";
import { StudentProfileGate } from "./StudentProfileGate";

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
        path: "/onboarding",
        element: <OnboardingPage />,
      },

      {
        element: <OrganizationGate />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: "/dashboard",
                element: <DashboardRedirect />,
              },

              {
                element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]} />,
                children: [
                  { path: "/dashboard/super-admin", element: <SuperAdminDashboardPage /> },
                  { path: "/dashboard/super-admin/admins", element: <SuperAdminAdminsPage /> },
                  { path: "/dashboard/super-admin/teachers", element: <SuperAdminTeachersPage /> },
                  { path: "/dashboard/super-admin/students", element: <SuperAdminStudentsPage /> },
                  {
                    path: "/dashboard/super-admin/students/import",
                    element: <SuperAdminStudentImportPage />,
                  },
                  { path: "/dashboard/super-admin/settings", element: <SuperAdminSettingsPage /> },
                ],
              },

              {
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                  { path: "/dashboard/admin", element: <AdminDashboardPage /> },
                  { path: "/dashboard/admin/teachers", element: <AdminTeachersPage /> },
                  { path: "/dashboard/admin/students", element: <AdminStudentsPage /> },
                  { path: "/dashboard/admin/students/import", element: <AdminStudentImportPage /> },
                ],
              },

              {
                element: <RoleGuard allowedRoles={[Role.TEACHER]} />,
                children: [
                  { path: "/dashboard/teacher", element: <TeacherDashboardPage /> },
                ],
              },

              {
                element: <RoleGuard allowedRoles={[Role.STUDENT]} />,
                children: [
                  {
                    path: "/dashboard/student/complete-profile",
                    element: <CompleteStudentProfilePage />,
                  },
                  {
                    element: <StudentProfileGate />,
                    children: [
                      { path: "/dashboard/student", element: <StudentDashboardPage /> },
                      { path: "/dashboard/student/profile", element: <StudentProfilePage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundState />,
  },
]);
