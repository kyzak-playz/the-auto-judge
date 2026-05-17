import {z} from "zod";
import type { UserSession } from "@/types/authTypes";

export const FormSchema = z.object({
    email: z.email({ error: "Please enter a valid email address" }).trim(),
    password: z.string()
        .min(8, { error: "Password must be at least 8 characters long" })
        .max(20, { error: "Password must be at most 20 characters long" })
        .regex(/(?=.*[a-z])/, { error: "Password must contain a lowercase letter" })
        .regex(/(?=.*[A-Z])/, { error: "Password must contain an uppercase letter" })
        .regex(/(?=.*\d)/, { error: "Password must contain a number" })
        .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/ , { error: "Password must contain a special character" }),
});

export type FormError = {
    success: false;
    error: {
        email?: string[];
        password?: string[];
        general?: string; // For non-field-specific errors, like authentication failures
    }
}

export type FormSuccess = {
    success: true;
    data : UserSession;
}

export type FormState = {
    email?: string;
    password?: string;
    authMode: "login" | "signup";
    result : FormError | FormSuccess;
};