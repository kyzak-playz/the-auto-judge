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
};

/**
 * AuthUIChildProps defines the properties that are passed down to child components of the authentication UI. It includes the authMode property, which indicates whether the current mode is "login" or "signup". This allows child components to adjust their behavior and presentation based on the current authentication mode, such as displaying different form fields or validation rules for login versus signup.
 */
export type AuthUIChildProps = {
  authMode: AuthMode;
};

/**
 * UserCredentials represents the data structure for user credentials that are required for authentication. It includes the username and password fields, which are necessary for both login and signup processes. Additionally, it includes the authMode field, which indicates whether the credentials are being used for a login or signup operation. This type is essential for handling user input in the authentication forms and ensuring that the correct actions are taken based on the specified authentication mode.
 */
export type UserCredentials = {
  username: string; // Email or username of the user
  password: string;
  authMode: AuthMode;
};

export const AuthTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number(),
});

export const UserProfileSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  role: z.enum(["student", "admin", "user"]),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export type UserSession = {
  access_token: string;
  expires_in: number;
};

export type AuthenticatedSession = {
  session: UserSession;
  profile: UserProfile;
};

type UserErrorResponse = {
  success: false;
  error: {
    message: string;
    code: number;
    type?: string;
  };
};

type UserSuccessResponse = { data: AuthenticatedSession } & {
  success: true;
};

export type UserResponse = UserSuccessResponse | UserErrorResponse;
