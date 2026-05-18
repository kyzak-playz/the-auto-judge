// Make an api call to server with credentials and return the response
"use server";
import { makeError } from "@/lib/utils";
import { UserCredentials, UserResponse, UserSession, UserResponseSchema } from "@/types/authTypes";
import { cookies } from "next/headers";

export async function authenticateUser(
  formData: UserCredentials,
): Promise<UserResponse> {
  try {
    // Call the API route to authenticate the user
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/${formData.authMode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );

    // Check if the response is successful
    if (!response.ok) {
      type Erorr = {
          message: string;
          code: number;
          type: string;
      }
      const error: Erorr = await response.json();
      console.log("Authentication error:", error);
      return {
        success: false,
        error: {
          message: error.message,
          code: response.status,
          type: error.type,
        },
      }
    }

    const userData: UserSession & { refresh_token: string } = await response.json();
    // Validate the response data against the UserResponseSchema
    const validationResult = UserResponseSchema.safeParse(userData);
    if (!validationResult.success) {
      console.error("Invalid response data:", validationResult.error);
      throw makeError("Invalid response data from authentication API", 500, "AuthenticationError");
    }


    // Store the refresh token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refresh_token", userData.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Make the cookie accessible to the entire site
    });

    return {
      success: true,
      data: {
        access_token: userData.access_token,
        refresh_token: userData.refresh_token,
        expires_in: userData.expires_in,
      },
    };
  } catch (error) {
    throw makeError(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`, 500, "AuthenticationError");
  }
}
