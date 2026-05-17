"use server"
import z from "zod";
import { authenticateUser } from "./authenticate-user";
import { FormState, FormSchema } from "@/schema/form-schema";

export async function validateFormAction(prevState: FormState , formData: FormData): Promise<FormState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = FormSchema.safeParse({ email, password }); // Validate form data using Zod schema

    if (!result.success) {
        // If validation fails, extract the field errors and return them in the state
        const { fieldErrors } = z.flattenError(result.error);
        return {
            email,
            password,
            authMode: prevState.authMode,
            result: {
                success: false,
                error: fieldErrors as { email?: string[]; password?: string[] } // Type assertion to match the expected error structure
            }
        };
    }
    
    try {
    // If validation is successful, make a user authentication call
    const user_response = await authenticateUser({ email, password, authMode: prevState.authMode });

    // if user_response is an error, return the error message in the state
    if (!user_response.success) {
        return {
            email,
            password,
            authMode: prevState.authMode,
            result: {
                success: false,
                error: {
                    general: user_response.error.message // Assuming the error message is in this format
                } // Return general error message for authentication failure
            }
        };
    }

    // If authentication is successful, return the user session data in the state
    return {
        email,
        password,
        authMode: prevState.authMode,
        result: {
            success: true,
            data: {
                access_token: user_response.data.access_token,
                expiry: user_response.data.expiry
             }
            }
        }
    } catch (error) {
        return {
            email,
            password,
            authMode: prevState.authMode,
            result: {
                success: false,
                error: {
                    general: error instanceof Error ? error.message : String(error) // Handle unexpected errors and return a general error message
                }
            }
        };
    }
};





