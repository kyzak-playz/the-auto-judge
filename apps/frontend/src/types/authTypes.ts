/**
 * This file defines TypeScript types related to authentication in the frontend application. It includes types for representing the authentication mode (login or signup), properties for the authentication UI components, user credentials, and the structure of the response from the authentication API. These types are essential for ensuring type safety and consistency when handling authentication-related data throughout the frontend codebase.
 */
import { z } from "zod";

/**
 * AuthMode represents the current mode of the authentication UI, which can be either "login" or "signup". This type is used to determine which form to display and how to handle user input accordingly.
 */
export type AuthMode = "login" | "signup";

/**
 * AuthUIProps defines the properties that the authentication UI component expects to receive. It includes an onClose function that will be called when the user wants to close the authentication modal or interface. This allows the parent component to control the visibility of the authentication UI and perform any necessary cleanup when it is closed.
 */
export type AuthUIProps = {
    onClose: () => void;
}

/**
 * AuthUIChildProps defines the properties that are passed down to child components of the authentication UI. It includes the authMode property, which indicates whether the current mode is "login" or "signup". This allows child components to adjust their behavior and presentation based on the current authentication mode, such as displaying different form fields or validation rules for login versus signup.
 */
export type AuthUIChildProps = {
    authMode: AuthMode;
}

/**
 * UserCredentials represents the data structure for user credentials that are required for authentication. It includes the email and password fields, which are necessary for both login and signup processes. Additionally, it includes the authMode field, which indicates whether the credentials are being used for a login or signup operation. This type is essential for handling user input in the authentication forms and ensuring that the correct actions are taken based on the specified authentication mode.
 */
export type UserCredentials = {
    email: string;
    password: string;
    authMode: AuthMode;
}

/**
 * UserResponse represents the data structure for the response from the server after authentication. It includes the access token, refresh token, and expiry time. This type is used to parse and validate the response from the authentication API endpoint.
 */
export const UserResponseSchema = z.object({
    access_token: z.jwt({alg: "ES256"}),
    refresh_token: z.string(),
    expires_in: z.number()
});

type UserErrorResponse = {
    success: false;
    error: {
        message: string;
        code: number;
        type: string;
    }
}

type UserSuccessResponse = {data: z.infer<typeof UserResponseSchema>} & { success: true };

/**
 * UserResponse is a union type that can represent either a successful authentication response (UserResponse) or an error response (UserErrorResponse). This allows for proper handling of both success and error cases when making authentication requests to the server, ensuring that the frontend can respond appropriately based on the outcome of the authentication attempt.
 */
export type UserResponse = 
    | UserSuccessResponse 
    | UserErrorResponse;


/**
 * UserSession represents the current session of the authenticated user stored in memory. It includes the access token and its expiry time. This type is used to manage the user's session state within the frontend application, allowing for features such as automatic token refresh and session expiration handling.
 */
export type UserSession = {
    access_token: string;
    expires_in: number;
}