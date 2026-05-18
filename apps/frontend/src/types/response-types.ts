/**
 * This file defines TypeScript types for API responses in the frontend application. It includes types for successful responses, error responses, and specific responses related to refreshing authentication tokens. These types are crucial for ensuring type safety and consistency when handling API responses throughout the frontend codebase.
 */

/**
 * SucceessResponse represents a successful API response, containing a success flag set to true and the data returned from the API. The Data type is generic, allowing it to be used for various types of successful responses across the application.
 */
type SucceessResponse<Data> = {
    success: true;
    data: Data;
}

/**
 * ErrorResponse represents an error API response, containing a success flag set to false and an error object with details about the error. This type is used to handle and display API errors throughout the frontend application.
 */
type ErrorResponse = {
    success: false;
    error: {
        status: number;
        message: string;
        code : string;
    }
}

/**
 * ApiResponse is a union type that can represent either a successful response with data or an error response. This type is used as the return type for API calls, allowing the frontend code to handle both success and error cases in a type-safe manner.
 */
export type ApiResponse<Data> = 
    | SucceessResponse<Data>
    | ErrorResponse;


/**
 * SuccessRefreshTokenResponse represents a successful response for refreshing authentication tokens, containing a success flag set to true and the updated tokens and expiry time.
 */
type SuccessRefreshTokenResponse = {
    success: true;
    data: {
        accessToken: string;
        expires_in: number;
    }
}

/**
 * RefreshTokenResponse is a union type that can represent either a successful response with new tokens or an error response when attempting to refresh authentication tokens. This type is used specifically for handling the response from the token refresh API endpoint, allowing the frontend code to manage both success and error scenarios in a type-safe manner.
 */
export type RefreshTokenResponse = 
    | SuccessRefreshTokenResponse
    | ErrorResponse;