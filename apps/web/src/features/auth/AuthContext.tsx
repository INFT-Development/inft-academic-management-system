import { useEffect, useState, type ReactNode } from "react";
import type { MembershipSummary } from "@ams/shared";

import { AuthContext, type User } from "@/hooks/auth-context";
import { apiClient } from "@/api/client";
import {
  refreshToken as refreshAccessToken,
  getCurrentUser,
} from "./auth.api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<MembershipSummary[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateAccessToken(token: string) {
    setAccessToken(token);
  }

  async function restoreSession() {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    const storedMemberships = localStorage.getItem("memberships");

    if (token && storedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(storedUser));
        setMemberships(storedMemberships ? JSON.parse(storedMemberships) : []);
        setIsLoading(false);
        return;
      } catch {
        localStorage.clear();
      }
    }

    const refreshed = await refreshSession();

    if (!refreshed) {
      clearSession();
    }

    setIsLoading(false);
  }

  function persistSession(
    token: string,
    refreshTokenValue: string,
    sessionUser: User,
    sessionMemberships: MembershipSummary[],
  ) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshTokenValue);
    localStorage.setItem("user", JSON.stringify(sessionUser));
    localStorage.setItem("memberships", JSON.stringify(sessionMemberships));

    setAccessToken(token);
    setUser(sessionUser);
    setMemberships(sessionMemberships);
  }

  function login(
    token: string,
    refreshTokenValue: string,
    loggedInUser: User,
    loginMemberships: MembershipSummary[],
  ) {
    persistSession(token, refreshTokenValue, loggedInUser, loginMemberships);
  }

  async function refreshSession(): Promise<boolean> {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await refreshAccessToken(storedRefreshToken);
      const { user: refreshedUser, memberships: refreshedMemberships } =
        response.data;

      persistSession(
        response.data.accessToken,
        response.data.refreshToken || storedRefreshToken,
        refreshedUser,
        refreshedMemberships,
      );

      return true;
    } catch {
      return false;
    }
  }

  async function refreshMemberships() {
    try {
      const response = await getCurrentUser();

      setMemberships(response.data.memberships);
      localStorage.setItem(
        "memberships",
        JSON.stringify(response.data.memberships),
      );
    } catch {
      // Leave the cached memberships in place if this fails; the next
      // authenticated request will surface any real auth problem.
    }
  }

  function clearSession() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("memberships");
    localStorage.removeItem("selectedOrganizationId");

    setAccessToken(null);
    setUser(null);
    setMemberships([]);
  }

  function logout() {
    const token = localStorage.getItem("accessToken");

    if (token) {
      apiClient("/auth/logout", {
        method: "POST",
        token,
      }).catch(() => {
        // Local logout still happens if the API request fails.
      });
    }

    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        accessToken,
        isLoading,
        isAuthenticated: Boolean(accessToken && user),
        updateAccessToken,
        login,
        refreshSession,
        refreshMemberships,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
