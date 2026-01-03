import { NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Validates request body against a Zod schema
 * Returns parsed data on success, or NextResponse error on failure
 */
export async function validateRequestBody<T extends ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Validation failed", details: errors },
          { status: 400 }
        ),
      };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Invalid JSON body" },
          { status: 400 }
        ),
      };
    }
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  try {
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Invalid query parameters", details: errors },
          { status: 400 }
        ),
      };
    }
    throw error;
  }
}

/**
 * Common query param schemas
 */
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default("1"),
  page_size: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default("20"),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});
