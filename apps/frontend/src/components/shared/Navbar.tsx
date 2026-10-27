"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import ProfileComponent from "@/components/shared/profile/ProfileComponent";

const pageLinks = [
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const setAuthOpen = useAuthStore((state) => state.setAuthOpen);
  const user = useAuthStore((state) => state.user);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-[#080b12]/85 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-xs font-black text-white shadow-lg shadow-indigo-500/20">
            AJ
          </span>
          <span>The Auto Judge</span>
        </Link>

        <div
          className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1 md:flex"
          aria-label="Page links"
        >
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div
          className={cn("flex items-center gap-2", { hidden: user })}
          aria-label="Authentication actions"
        >
          <button
            onClick={() => setAuthOpen(true)}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className:
                "bg-indigo-500 px-4 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400",
            })}
          >
            Get Started
          </button>
        </div>
        {user && <ProfileComponent name="Kyzak" email="kyzakplays@gmail.com" />}
      </nav>
    </header>
  );
}
