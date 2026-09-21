import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "ERROR"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(status: number, message: string, code = "ERROR") {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Wraps a route handler with consistent error handling. */
export function handleRoute(handler: () => Promise<NextResponse>) {
  return handler().catch((err) => {
    if (err instanceof ApiError) {
      return fail(err.status, err.message, err.code);
    }
    if (err instanceof ZodError) {
      const message = err.issues
        .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
        .join("; ");
      return fail(422, message, "VALIDATION_ERROR");
    }
    console.error("[API]", err);
    return fail(500, "Internal server error");
  });
}
