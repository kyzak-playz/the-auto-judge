/**
 * This component serves as a wrapper for pages that require authentication. It checks if the user is authenticated and, if not, it can display an authentication UI component. It also handles the logic for opening the authentication UI based on URL query parameters and ensures that the URL is cleaned up after opening the UI.
 * The component uses the `useAuthGuard` hook to manage authentication state and session refreshing. It checks if the authentication UI should be open based on the presence of an "auth" query parameter in the URL and the current authentication state. If the user is not authenticated and the "auth" query parameter is set to "true", it opens the authentication UI and then removes the "auth" parameter from the URL to prevent it from being triggered again on page reloads.
 * The authentication UI component is conditionally rendered based on the current pathname, user authentication state, and whether the authentication UI should be open.
 */

"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthUIComponent from "@/components/shared/AuthUIComponent";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const authQueryParam = searchParams.get("auth");
  const shouldOpenAuthUI = authQueryParam === "true";
  const {authOpen, user} = useAuthGuard();

  useEffect(() => {
    if (shouldOpenAuthUI && !authOpen) {
      // Open overlay
      useAuthStore.getState().setAuthOpen(true);

      // Clean up URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl); // replaces history entry, no reload
    }
  }, [shouldOpenAuthUI, authOpen, pathname, router, searchParams]);

  return (
    <>
      {children}
      {!user && authOpen && <AuthUIComponent />}
    </>
  );
}
