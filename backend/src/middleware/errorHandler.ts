import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void | Response => {
  console.error("Error:", error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "Resource already exists",
    });
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2025"
  ) {
    return res.status(404).json({
      error: "Not found",
      message: "Resource not found",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error"
        : "Something went wrong",
  });
};
