"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = useAuthStore((state) => state.profile);
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const isAdmin = status === "authenticated" && profile?.role === "admin";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router, status]);

  if (!isAdmin) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center text-sm text-slate-400">
        Checking admin access...
      </main>
    );
  }

  return children;
}
