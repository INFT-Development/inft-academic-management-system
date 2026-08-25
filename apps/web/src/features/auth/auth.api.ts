import { apiClient } from "@/api/client";
import type {
  ApiSuccess,
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from "@ams/shared";

export type RegisterResponse = ApiSuccess<{ user: User }>;
export type LoginResponse = ApiSuccess<AuthSession>;
export type RefreshResponse = ApiSuccess<AuthSession>;
export type MeResponse = ApiSuccess<Omit<AuthSession, "accessToken" | "refreshToken">>;

export async function registerUser(
  data: RegisterInput,
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(
  data: LoginInput,
): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipRefresh: true,
  });
}

export async function refreshToken(
  refreshTokenValue: string,
): Promise<RefreshResponse> {
  return apiClient<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
    }),
  });
}

export async function getCurrentUser(): Promise<MeResponse> {
  return apiClient<MeResponse>("/auth/me");
}
