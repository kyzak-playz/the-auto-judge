import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export interface AuthError extends Error {
    status?: number;
    code?: string
}

export function makeError(message: string, statusCode: number, code: string): AuthError {
  const err = new Error(message) as AuthError;
  err.status = statusCode;
  err.code = code;
  return err;
}