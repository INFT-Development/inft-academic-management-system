import {
  useEffect,
  useState,
  type ReactNode,
} from "react";


import {AuthContext,type User} from "@/hooks/auth-context";
import { apiClient } from "@/api/client";
import { refreshToken as refreshAccessToken } from "./auth.api";


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  function updateAccessToken(token: string) {
  setAccessToken(token);
}

  async function restoreSession() {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);

        setAccessToken(token);
        setUser(parsedUser);

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

  function login(
    token: string,
    refreshTokenValue: string,
    loggedInUser: User,
  ) {
    localStorage.setItem("accessToken", token);

    localStorage.setItem(
      "refreshToken",
      refreshTokenValue,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser),
    );

    setAccessToken(token);
    setUser(loggedInUser);
  }

  async function refreshSession(): Promise<boolean> {
    const storedRefreshToken =
      localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await refreshAccessToken(
        storedRefreshToken,
      );

      const newAccessToken =
        response.data.accessToken;

      localStorage.setItem(
        "accessToken",
        newAccessToken,
      );

      if (response.data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          response.data.refreshToken,
        );
      }

      setAccessToken(newAccessToken);

      return true;
    } catch {
      return false;
    }
  }

  function clearSession() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setAccessToken(null);
    setUser(null);
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
        accessToken,
        isLoading,
        isAuthenticated: Boolean(
          accessToken && user,
        ),
        updateAccessToken,
        login,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
