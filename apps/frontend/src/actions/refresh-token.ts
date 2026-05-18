"use server";
import { cookies } from "next/headers";
import { UserSession } from "@/types/authTypes";
import { makeError } from "@/lib/utils";
import { RefreshTokenResponse } from "@/types/response-types";

/**
 * Refresh token payload returned by server.
 */
type TokenPayload = UserSession & { refresh_token: string };

// A module-level variable to hold the ongoing refresh token promise for deduplication
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

/**
 * Refreshes the authentication token using the refresh token stored in cookies.
 * @returns A promise resolving to the refreshed token or an error.
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  // Deduplicate concurrent refresh requests
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * Performs the actual token refresh operation by making an API call to the backend.
 * @expect The function extracts the refresh token from cookies, makes a POST request to the refresh endpoint, and handles the response accordingly.
 * @returns A promise resolving to the refreshed token or an error.
 */
export async function performRefresh(): Promise<RefreshTokenResponse> {
  // Extract refresh token from cookies
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  try {
    // if no refresh token is found then return an error response
    if (!refreshToken) {
      return {
        success: false,
        error: {
          status: 401,
          message: "No refresh token found",
          code: "NO_REFRESH_TOKEN"
        },
      };
    }

    // Call the API route to refresh the token
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/auth/refresh`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          status: response.status,
          message: "Failed to refresh token",
          code: "REFRESH_TOKEN_FAILED"
        },
      };
    }

    const userData: TokenPayload = await response.json();
    // set the new refresh token in the cookie
      cookieStore.set({
        name: "refresh_token",
        value: userData.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

    return {
      success: true,
      data: {
        accessToken: userData.access_token,
        expires_in: userData.expires_in,
      },
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    throw makeError(
      `Refresh token failed: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "RefreshTokenError",
    );
  }
}
