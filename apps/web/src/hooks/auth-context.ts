// filepath: d:\Projects\inft-academic-management-system\apps\web\src\features\auth\auth-context.ts
import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateAccessToken: (token: string) => void;
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => void;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);