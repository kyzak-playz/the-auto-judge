"use client";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import logout from "@/actions/logut";

type ProfileComponentProps = {
    name?: string;
    email?: string;
    avatarUrl?: string | null;
    settingsHref?: string
};

function getInitials(name?: string) {
    if (!name) {
        return "U";
    }

    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function EditIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
                d="M12.9 3.6a1.8 1.8 0 0 1 2.55 0l.95.95a1.8 1.8 0 0 1 0 2.55l-8.7 8.7-3.6.8.8-3.6 8.7-8.7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path d="M11.5 5 15 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
                d="M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="m2.5 10 1.7-.3a6.4 6.4 0 0 1 .8-1.9l-1-1.4 1.9-1.9 1.4 1a6.4 6.4 0 0 1 1.9-.8L10 2.5l1.3 1.7a6.4 6.4 0 0 1 1.9.8l1.4-1 1.9 1.9-1 1.4a6.4 6.4 0 0 1 .8 1.9l1.7.3v2.8l-1.7.3a6.4 6.4 0 0 1-.8 1.9l1 1.4-1.9 1.9-1.4-1a6.4 6.4 0 0 1-1.9.8L10 17.5l-1.3-1.7a6.4 6.4 0 0 1-1.9-.8l-1.4 1-1.9-1.9 1-1.4a6.4 6.4 0 0 1-.8-1.9l-1.7-.3V10Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
                d="M8 5.5H5.5A1.5 1.5 0 0 0 4 7v6A1.5 1.5 0 0 0 5.5 14.5H8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M11 10h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="m9 8 2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 5.5H14A1.5 1.5 0 0 1 15.5 7v6A1.5 1.5 0 0 1 14 14.5h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ProfileComponent({
    name = "Profile",
    email = "user@example.com",
    avatarUrl = null,
    settingsHref = "/settings"
}: ProfileComponentProps) {
    const initials = getInitials(name);

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 px-3 py-2 text-zinc-100 shadow-sm shadow-black/10 backdrop-blur-sm">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-sm font-semibold text-zinc-100">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={`${name} avatar`}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span aria-hidden="true">{initials}</span>
                )}

                <button
                    type="button"
                    onClick={() => alert("Edit profile functionality not implemented yet.")}
                    aria-label="Edit profile"
                    className="absolute -bottom-0.5 -right-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-200 shadow-sm transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                >
                    <EditIcon />
                </button>
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-50">{name}</p>
                {email ? <p className="truncate text-xs text-zinc-400">{email}</p> : null}
            </div>

            <div className="ml-auto flex items-center gap-2">
                <Link
                    href={settingsHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-100 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                >
                    <SettingsIcon />
                    Settings
                </Link>

                <LogOutButton />
            </div>
        </div>
    );
}

const LogOutButton = () => {
    const clearSession = useAuthStore((state) => state.clearSession);
    const user = useAuthStore((state) => state.user);
    
    const handleLogout = async () => {
        // Attempt to log out via the API, but clear session locally regardless of API response to ensure user is logged out
        if (user) {
            const res = await logout(user.access_token);
            if (res) {
                clearSession();
            } else {
                console.error("Logout failed. Clearing session locally as fallback.");
                const user_input = confirm("Complications with logging out. Click OK to clear session locally.");
                if (user_input) clearSession();
                else alert("Logout failed. Please try again.");
            }
        }
    }
    return (
        <button onClick={handleLogout} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <LogoutIcon />
        </button>
    );
};