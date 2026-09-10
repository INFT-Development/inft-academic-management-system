import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./features/auth/AuthContext";
import { OrganizationProvider } from "./features/organization/OrganizationProvider";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes/router";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OrganizationProvider>
        
        <RouterProvider router={router} />
      </OrganizationProvider>
      <Toaster />
    </AuthProvider>
  </StrictMode>,
);