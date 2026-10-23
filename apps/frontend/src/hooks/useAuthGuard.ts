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
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "loading") return;

    const getNewSession = async () => {
      try {
        const response = await refreshSession();

        if (response.success) {
          useAuthStore.getState().setUser({
            access_token: response.data.accessToken,
            expires_in: response.data.expiry,
          });
        } else {
          useAuthStore.getState().setStatus("unauthenticated");
        }
      } catch {
        useAuthStore.getState().setStatus("unauthenticated");
        useAuthStore.getState().setAuthOpen(true);
      }
    };

    getNewSession();
  }, [status]);

  return { authOpen, user, status };
}
