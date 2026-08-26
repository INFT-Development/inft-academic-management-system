import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    console.warn(`[${error.statusCode}] ${error.message}`);

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}