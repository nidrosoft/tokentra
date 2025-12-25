import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { apiError } from "./response";

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid request data",
      400,
      { issues: error.issues }
    );
  }

  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (error.message === "Forbidden") {
      return apiError("FORBIDDEN", "Insufficient permissions", 403);
    }

    if (error.message === "Not Found") {
      return apiError("NOT_FOUND", "Resource not found", 404);
    }
  }

  return apiError("INTERNAL_ERROR", "An unexpected error occurred", 500);
}
