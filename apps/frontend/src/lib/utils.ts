import { AuthError } from "@supabase/supabase-js";

export { cn } from "cn";

export function makeError(
  message: string,
  statusCode: number,
  code: string
): AuthError {
  const err = new Error(message) as AuthError;
  err.status = statusCode;
  err.code = code;
  return err;
}
