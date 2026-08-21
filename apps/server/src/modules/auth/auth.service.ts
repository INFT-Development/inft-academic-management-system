import { supabaseAdmin } from "../../config/supabase";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type { User } from "../../generated/prisma/client";
import {Role} from "../../constants/roles";
export interface RegisterInput {
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput
): Promise<{  id: string;
  email: string;
  role: User["role"];}> {
  const { email, password } = input;

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if the user already exists in Prisma
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // 2. Create the authentication user in Supabase
  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

  if (error) {
    // Supabase may already contain the email even if
    // the Prisma user does not exist.
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists")
    ) {
      throw new AppError("Email already registered", 409);
    }

    throw new AppError("Failed to create Supabase user", 500);
  }

  if (!data.user) {
    throw new AppError("Failed to create Supabase user", 500);
  }

  // 3. Create the application user in Prisma
  try {
    const user: User = await prisma.user.create({
      data: {
        id: data.user.id,
        email: normalizedEmail,
        role: Role.STUDENT, // Default role, adjust as needed
      },
    });

    return {
  id: user.id,
  email: user.email,
  role: user.role,
}
  } catch (error) {
    // Prisma creation failed, so remove the Supabase user
    // to prevent an orphaned authentication account.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } =
    await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (error) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!data.session || !data.user) {
    throw new AppError("Login failed", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: data.user.id,
    },
  });

  if (!dbUser) {
    throw new AppError("User account not found", 404);
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    },
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

export async function refreshSession(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const { data, error } =
    await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

  if (error || !data.session || !data.user) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: data.user.id,
    },
  });

  if (!dbUser) {
    throw new AppError("User account not found", 404);
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    },
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

export async function logoutUser(accessToken: string) {
  if (!accessToken) {
    throw new AppError("Access token is required", 400);
  }

  const { error } = await supabaseAdmin.auth.admin.signOut(
    accessToken
  );

  if (error) {
    throw new AppError("Logout failed", 401);
  }
}