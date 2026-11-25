// Make an api call to server with credentials and return the response
"use server";
import { makeError } from "@/lib/utils";
import {
  AuthTokenResponseSchema,
  UserCredentials,
  UserResponse,
  UserProfileSchema,
} from "@/types/authTypes";
import { cookies } from "next/headers";

export async function authenticateUser(
  formData: UserCredentials
): Promise<UserResponse> {
  try {
    // Call the API route to authenticate the user
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/${formData.authMode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // following the backend's expected content type
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      }
    );

    // Check if the response is successful
    if (!response.ok) {
      type Erorr = {
        message: string;
        code: number;
        type: string;
      };
      const error: Erorr = await response.json();
      console.log("Authentication error:", error);
      return {
        success: false,
        error: {
          message: error.message,
          code: response.status,
          type: error.type,
        },
      };
    }

    const tokenValidation = AuthTokenResponseSchema.safeParse(
      await response.json()
    );
    if (!tokenValidation.success) {
      console.error("Invalid response data:", tokenValidation.error);
      throw makeError(
        "Invalid response data from authentication API",
        500,
        "AuthenticationError"
      );
    }
    const sessionData = tokenValidation.data;

    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${sessionData.access_token}`,
        },
      }
    );
    if (!profileResponse.ok) {
      throw makeError(
        "Unable to load the authenticated user profile",
        profileResponse.status,
        "UserProfileError"
      );
    }

    const profileValidation = UserProfileSchema.safeParse(
      await profileResponse.json()
    );
    if (!profileValidation.success) {
      console.error("Invalid user profile response:", profileValidation.error);
      throw makeError(
        "Invalid user profile response from authentication API",
        500,
        "UserProfileError"
      );
    }

    // Store the refresh token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refresh_token", sessionData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/", // Make the cookie accessible to the entire site
    });

    return {
      success: true,
      data: {
        session: {
          access_token: sessionData.access_token,
          expires_in: sessionData.expires_in,
        },
        profile: profileValidation.data,
      },
    };
  } catch (error) {
    throw makeError(
      `Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "AuthenticationError"
    );
  }
}
