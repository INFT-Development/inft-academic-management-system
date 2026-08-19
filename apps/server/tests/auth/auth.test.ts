import request from "supertest";

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../src/config/supabase", () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
        signOut: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { supabaseAdmin } from "../../src/config/supabase";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;

const mockCreateUser =
  supabaseAdmin.auth.admin.createUser as jest.Mock;

const mockDeleteUser =
  supabaseAdmin.auth.admin.deleteUser as jest.Mock;

const mockSignInWithPassword =
  supabaseAdmin.auth.signInWithPassword as jest.Mock;

const mockRefreshSession =
  supabaseAdmin.auth.refreshSession as jest.Mock;

const mockGetUser =
  supabaseAdmin.auth.getUser as jest.Mock;

const mockSignOut =
  supabaseAdmin.auth.admin.signOut as jest.Mock;

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // REGISTRATION
  // ============================================================

  it("should reject registration with invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "invalid-email",
        password: "password123",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("should register a new student successfully", async () => {
    mockFindUnique.mockResolvedValue(null);

    mockCreateUser.mockResolvedValue({
      data: {
        user: {
          id: "supabase-user-123",
          email: "student@test.com",
        },
      },
      error: null,
    });

    mockCreate.mockResolvedValue({
      id: "supabase-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "student@test.com",
        password: "password123",
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Registration successful"
    );

    expect(response.body.data.user).toEqual({
      id: "supabase-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        email: "student@test.com",
      },
    });

    expect(mockCreateUser).toHaveBeenCalledWith({
      email: "student@test.com",
      password: "password123",
      email_confirm: true,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        id: "supabase-user-123",
        email: "student@test.com",
        role: "STUDENT",
      },
    });
  });

  it("should reject registration when email is already registered", async () => {
    mockFindUnique.mockResolvedValue({
      id: "existing-user-123",
      email: "existing@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "existing@test.com",
        password: "password123",
      });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Email already registered"
    );

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        email: "existing@test.com",
      },
    });

    expect(mockCreateUser).not.toHaveBeenCalled();

    expect(mockCreate).not.toHaveBeenCalled();
  });

  // ============================================================
  // LOGIN
  // ============================================================

  it("should login successfully with valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "supabase-user-123",
          email: "student@test.com",
        },
        session: {
          access_token: "access-token-123",
          refresh_token: "refresh-token-123",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "supabase-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@test.com",
        password: "password123",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Login successful"
    );

    expect(response.body.data).toEqual({
      user: {
        id: "supabase-user-123",
        email: "student@test.com",
        role: "STUDENT",
      },
      accessToken: "access-token-123",
      refreshToken: "refresh-token-123",
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "student@test.com",
      password: "password123",
    });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "supabase-user-123",
      },
    });
  });

  it("should reject login with invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Invalid login credentials",
      },
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "student@test.com",
        password: "wrongpassword",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid email or password"
    );

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "student@test.com",
      password: "wrongpassword",
    });

    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should reject login when Supabase user exists but Prisma user does not", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "supabase-user-456",
          email: "orphan@test.com",
        },
        session: {
          access_token: "access-token-456",
          refresh_token: "refresh-token-456",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "orphan@test.com",
        password: "password123",
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "User account not found"
    );

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "supabase-user-456",
      },
    });
  });

  // ============================================================
  // /ME
  // ============================================================

  it("should return the authenticated user from /me", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "supabase-user-123",
          email: "student@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "supabase-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "User retrieved successfully"
    );

    expect(response.body.data.user).toEqual({
      id: "supabase-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    expect(mockGetUser).toHaveBeenCalledWith(
      "valid-access-token"
    );

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "supabase-user-123",
      },
    });
  });

  it("should reject /me when authorization header is missing", async () => {
    const response = await request(app)
      .get("/api/auth/me");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Authentication required"
    );

    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("should reject /me with an invalid or expired token", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        message: "Invalid JWT",
      },
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set(
        "Authorization",
        "Bearer invalid-access-token"
      );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid or expired token"
    );

    expect(mockGetUser).toHaveBeenCalledWith(
      "invalid-access-token"
    );

    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should reject /me when the Supabase user does not exist in Prisma", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "orphan-user-123",
          email: "orphan@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/auth/me")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "User account not found"
    );

    expect(mockGetUser).toHaveBeenCalledWith(
      "valid-access-token"
    );

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "orphan-user-123",
      },
    });
  });

  // ============================================================
  // ROLE AUTHORIZATION
  // ============================================================

  it("should allow an ADMIN to access /admin-test", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "admin-user-123",
          email: "admin@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "admin-user-123",
      email: "admin@test.com",
      role: "ADMIN",
    });

    const response = await request(app)
      .get("/api/auth/admin-test")
      .set(
        "Authorization",
        "Bearer admin-access-token"
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "You have admin access"
    );

    expect(response.body.data.user).toEqual({
      id: "admin-user-123",
      email: "admin@test.com",
      role: "ADMIN",
    });
  });

  it("should reject a STUDENT from accessing /admin-test", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "student-user-123",
          email: "student@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "student-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .get("/api/auth/admin-test")
      .set(
        "Authorization",
        "Bearer student-access-token"
      );

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  });

  it("should reject a TEACHER from accessing /admin-test", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "teacher-user-123",
          email: "teacher@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "teacher-user-123",
      email: "teacher@test.com",
      role: "TEACHER",
    });

    const response = await request(app)
      .get("/api/auth/admin-test")
      .set(
        "Authorization",
        "Bearer teacher-access-token"
      );

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  });

  it("should reject /admin-test without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/admin-test");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Authentication required"
    );
  });

  // ============================================================
  // REFRESH TOKEN
  // ============================================================

  it("should refresh the session successfully", async () => {
    mockRefreshSession.mockResolvedValue({
      data: {
        user: {
          id: "student-user-123",
          email: "student@test.com",
        },
        session: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "student-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: "old-refresh-token",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Token refreshed successfully"
    );

    expect(response.body.data).toEqual({
      user: {
        id: "student-user-123",
        email: "student@test.com",
        role: "STUDENT",
      },
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    expect(mockRefreshSession).toHaveBeenCalledWith({
      refresh_token: "old-refresh-token",
    });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        id: "student-user-123",
      },
    });
  });

  it("should reject an invalid refresh token", async () => {
    mockRefreshSession.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Invalid refresh token",
      },
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: "invalid-refresh-token",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid or expired refresh token"
    );

    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should reject refresh when refresh token is missing", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(mockRefreshSession).not.toHaveBeenCalled();
  });

  // ============================================================
  // LOGOUT
  // ============================================================

  it("should logout successfully", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "student-user-123",
          email: "student@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "student-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    mockSignOut.mockResolvedValue({
      error: null,
    });

    const response = await request(app)
      .post("/api/auth/logout")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Logout successful"
    );

    expect(mockSignOut).toHaveBeenCalledWith(
      "valid-access-token"
    );
  });

  it("should reject logout without authentication", async () => {
    const response = await request(app)
      .post("/api/auth/logout");

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Authentication required"
    );
  });

  it("should reject logout when Supabase logout fails", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "student-user-123",
          email: "student@test.com",
        },
      },
      error: null,
    });

    mockFindUnique.mockResolvedValue({
      id: "student-user-123",
      email: "student@test.com",
      role: "STUDENT",
    });

    mockSignOut.mockResolvedValue({
      error: {
        message: "Logout failed",
      },
    });

    const response = await request(app)
      .post("/api/auth/logout")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Logout failed"
    );

    expect(mockSignOut).toHaveBeenCalledWith(
      "valid-access-token"
    );
  });
});