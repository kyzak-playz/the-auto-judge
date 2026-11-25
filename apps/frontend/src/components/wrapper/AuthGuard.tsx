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
  const { authOpen, status } = useAuthGuard();

  useEffect(() => {
    // Only auto-open the modal when ?auth=true is explicitly triggered (e.g. by proxy.ts)
    if (shouldOpenAuthUI && !authOpen) {
      useAuthStore.getState().setAuthOpen(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl);
    }
  }, [shouldOpenAuthUI, authOpen, pathname, router, searchParams]);

  return (
    <>
      {status === "loading" ? (
        <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 text-slate-400">
          Restoring session...
        </main>
      ) : (
        children
      )}

      {/* Render Auth UI as an overlay/modal whenever authOpen is true */}
      {authOpen && status !== "authenticated" && <AuthUIComponent />}
    </>
  );
}
