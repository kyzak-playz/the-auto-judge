"use server";
import { cookies } from "next/headers";
import { makeError } from "@/lib/utils";
import { ApiResponse } from "@/types/response-types";

/**
 * A custom fetch function that checks for the presence of a refresh token before making an API call.
 */
export const fetchAction = async<Data> (
  request: RequestInfo,
  init: RequestInit,
): Promise<ApiResponse<Data>> => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // If no refresh token is found, return an error response
    if (!refreshToken) {
      return {
        success: false,
        error: {
          status: 401,
          message: "No refresh token found",
          code: "NoRefreshTokenError",
        },
      };
    }

    const response = await fetch(request, init); // Make the API call with the provided request and init parameters

    // If the response is not ok, return an error response
    if (!response.ok) {
      return {
        success: false,
        error: {
          status: response.status,
          message: `API call failed with status ${response.status}`,
          code: "ApiCallError",
        },
      };
    }

    // If the response is ok, return the successful response with the parsed JSON data
    const result = await response.json();
    return {
      success: true,
      data: result,
    }; // Return the successful response
  } catch (error) {
    console.error("Fetch action error:", error);
    throw makeError(
      `Fetch action failed: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "FetchActionError",
    );
  }
};
