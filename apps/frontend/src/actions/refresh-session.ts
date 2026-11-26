"use server";
import { cookies } from "next/headers";
import { refreshToken } from "@/actions/refresh-token";
import { UserProfileSchema, type UserProfile } from "@/types/authTypes";

type Error = {
  success: false;
};

type Success = {
  success: true;
  data: {
    accessToken: string;
    expires_in: number;
    profile: UserProfile;
  };
};

type RefreshSessionResponse = Success | Error;
/**
 * Refreshes the user's session using a refresh token.
 * @returns A promise resolving to the refreshed session data or an error.
 *
 * (Note: This function is intended to be used in a server-side context, as it accesses cookies directly.)
 */
const refreshSession = async (): Promise<RefreshSessionResponse> => {
  const cookieStore = await cookies();
  const refresh_token = cookieStore.get("refresh_token")?.value;

  if (!refresh_token) {
    // No refresh token found, clear session
    return {
      success: false,
    };
  }

  const response = await refreshToken();

  if (!response.success) {
    // Refresh failed, clear session
    return {
      success: false,
    };
  }

  // Refresh successful, update session with new token
  const newSession = response.data;
  const profileResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${newSession.accessToken}`,
      },
    }
  );
  if (!profileResponse.ok) {
    throw new Error("Unable to load the authenticated user profile");
  }

  const profileResult = UserProfileSchema.safeParse(
    await profileResponse.json()
  );
  if (!profileResult.success) {
    throw new Error("Invalid user profile response from authentication API");
  }

  return {
    success: true,
    data: {
      ...newSession,
      profile: profileResult.data,
    },
  };
};

export default refreshSession;
