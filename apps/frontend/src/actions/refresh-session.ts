"use server";
import { cookies } from "next/headers";
import { refreshToken } from "@/actions/refresh-token";

type Error = {
    success: false;
}

type Success = {
    success: true;
    data: {
        accessToken: string;
        expiry: number;
    }
}

type RefreshSessionResponse = Success | Error;

const refreshSession = async (): Promise<RefreshSessionResponse> => {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get("refresh_token")?.value;

    if (!refresh_token) {
        // No refresh token found, clear session
        return {
            success: false,
        }
    }

    const response = await refreshToken();

    if (!response.success) {
        // Refresh failed, clear session
        return {
            success: false
        };
    }

    // Refresh successful, update session with new token
    const newSession = response.data;
    // Update your session store with the new session data here
    // For example: updateSessionStore(newSession);
    return {
        success: true,
        data: newSession
    };
}

export default refreshSession;