import { useAuthStore } from "@/store/authStore";
import { fetchAction } from "@/actions/fetch-action";
import { refreshToken } from "@/actions/refresh-token";
import { makeError } from "@/lib/utils";
import { ApiResponse } from "@/types/response-types";

/**
 * A custom fetch function for making API requests with automatic token refresh functionality.
 * @param input The input to the fetch function, which can be a URL string or a Request object.
 * @param init The initialization options for the fetch function.
 * @returns (ApiResponse<Data>) A promise resolving to the API response.
 */
const clientFetch = async <Data>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<Data>> => {
  const user = useAuthStore.getState().user; // use getState method to get the current value

  if (!user || !user.access_token) {
    throw makeError("No access token found", 401, "NoAccessTokenError");
  }

  // Set the Authorization header with the access token for authenticated requests
  init = {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${user.access_token}`,
    },
  };

  try {
    // Use the custom fetchAction to make the API call, which will handle token refresh if needed
    const response = await fetchAction<Data>(input, init);

    // if response not ok, then check if refresh token is expired or doesn't exist
    if (response.success === false) {
      // If the error status is 401, it indicates that the access token is invalid or expired
      if (response.error.status === 401) {
        return {
          success: false,
          error: {
            status: response.error.status,
            message: response.error.message,
            code: response.error.code,
          },
        };
      }

      const refreshResponse = await refreshToken(); // Attempt to refresh the token

      if (!refreshResponse.success) {
        // check if refresh was successful

        // Old token not found
        if (refreshResponse.error.status === 401) {
          return {
            success: false,
            error: {
              status: refreshResponse.error.status,
              message: "Session expired. Please log in again.",
              code: refreshResponse.error.code,
            },
          };
        }
        // Refresh failed for other reasons
        return {
          success: false,
          error: {
            status: refreshResponse.error.status,
            message: refreshResponse.error.message,
            code: refreshResponse.error.code,
          },
        };
      }

      // Update the access token in the auth store
      useAuthStore.getState().setUser({
        access_token: refreshResponse.data.accessToken,
        expiry: refreshResponse.data.expiry,
      });

      // Update the Authorization header with the new access token and retry the original request

      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${refreshResponse.data.accessToken}`,
      };

      return await fetchAction<Data>(input, init); // Retry the original request with the new token
    }

    return response; // Return the successful response
  } catch (error) {
    throw makeError(
      `Client fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "ClientFetchError",
    );
  }
};

export default clientFetch;
