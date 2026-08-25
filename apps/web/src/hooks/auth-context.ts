import { createContext } from "react";
import type { User, MembershipSummary } from "@ams/shared";

export type { User, MembershipSummary };

export interface AuthContextValue {
  user: User | null;
  memberships: MembershipSummary[];
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateAccessToken: (token: string) => void;
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
    memberships: MembershipSummary[],
  ) => void;
  refreshSession: () => Promise<boolean>;
  refreshMemberships: () => Promise<void>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);
