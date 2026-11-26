"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import refreshSession from "@/actions/refresh-session";

// Module-level lock — survives React Strict Mode double-renders
let isRefreshing = false;

/**
 * Custom hook to manage authentication state and session refreshing.
 * It checks if the authentication UI is open or if a user session exists.
 * If neither is true, it attempts to refresh the session using a refresh token.
 * @returns An object containing the authentication state (authOpen) and user session (user).
 * The hook will automatically update the user session in the auth store if a new session is obtained.
 */
export function useAuthGuard() {
  const authOpen = useAuthStore((s) => s.authOpen);
  const profile = useAuthStore((s) => s.profile);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "loading" || isRefreshing) return;

    // Set the lock to prevent multiple refresh attempts
    isRefreshing = true;
    const getNewSession = async () => {
      try {
        const response = await refreshSession();

        if (response.success) {
          useAuthStore.getState().setAuthenticated({
            session: {
              access_token: response.data.accessToken,
              expires_in: response.data.expires_in,
            },
            profile: response.data.profile,
          });
        } else {
          useAuthStore.getState().clearSession();
        }
      } catch {
        useAuthStore.getState().setStatus("unauthenticated");
        useAuthStore.getState().clearSession();
      } finally {
        isRefreshing = false; // Release the lock after the refresh attempt
      }
    };

    getNewSession();
  }, [status]);

  return { authOpen, profile, status };
}
