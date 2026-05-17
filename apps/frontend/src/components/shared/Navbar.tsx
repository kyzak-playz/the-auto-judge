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
            className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur supports-backdrop-filter:bg-zinc-950/75 transition-all duration-300 translate-y-0 opacity-100"
            aria-label="Main navigation"
        >
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
                <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
                    Auto Judge
                </Link>

                <div className="hidden items-center gap-6 md:flex" aria-label="Page links">
                    {pageLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-zinc-300 transition-colors hover:text-zinc-100"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className={cn("flex items-center gap-2", { "hidden": user })} aria-label="Authentication actions">
                    <button
                        onClick={() => setAuthOpen(true)}
                        className={buttonVariants({ variant: "default", size: "sm" })}
                    >
                        Get Started
                    </button>
                </div>
                {/* If user is authenticated, show the ProfileComponent instead of Get Started */
                  user && <ProfileComponent name="Kyzak" email="kyzakplays@gmail.com" />
                }
            </nav>
        </header>
    );
}