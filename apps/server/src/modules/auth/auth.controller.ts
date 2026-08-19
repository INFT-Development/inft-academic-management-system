import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import type { User } from "../../generated/prisma/client";
import { AppError } from "../../utils/AppError";


export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.loginUser(
      req.body.email,
      req.body.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshSession(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const accessToken = authHeader.split(" ")[1];

    await authService.logoutUser(accessToken);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}


export async function me(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function adminTest(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: "You have admin access",
    data: {
      user: req.user,
    },
  });
}