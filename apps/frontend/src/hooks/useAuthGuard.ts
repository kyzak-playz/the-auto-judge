"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import refreshSession from "@/actions/refresh-session";

/**
 * Custom hook to manage authentication state and session refreshing.
 * It checks if the authentication UI is open or if a user session exists.
 * If neither is true, it attempts to refresh the session using a refresh token.
 * @returns An object containing the authentication state (authOpen) and user session (user).
 * The hook will automatically update the user session in the auth store if a new session is obtained.
 */
export function useAuthGuard() {
  const authOpen = useAuthStore((s) => s.authOpen);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // if the authentication UI is open or if a user session already exists, do not attempt to refresh the session
    if (authOpen || user) return;

    const getNewSession = async () => {
      const response = await refreshSession();
      if (response.success) {
        useAuthStore.getState().setUser({
          access_token: response.data.accessToken,
          expiry: response.data.expiry,
        });
      }
    };

    getNewSession();
  }, [authOpen, user]);

  return { authOpen, user };
}
