// store/authStore.ts
import { create } from "zustand";
import type {
  AuthenticatedSession,
  UserProfile,
  UserSession,
} from "@/types/authTypes";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  session: UserSession | null;
  profile: UserProfile | null;
  authOpen: boolean;
  status: AuthStatus;
  setAuthenticated: (authenticated: AuthenticatedSession) => void;
  setSession: (session: UserSession) => void;
  setStatus: (status: AuthStatus) => void;
  setAuthOpen: (open: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  authOpen: false,
  status: "loading",
  setAuthenticated: ({ session, profile }) =>
    set({ session, profile, status: "authenticated" }),
  setSession: (session) => set({ session, status: "authenticated" }),
  setStatus: (status) => set({ status }),
  setAuthOpen: (open) => set({ authOpen: open }),
  clearSession: () =>
    set({
      session: null,
      profile: null,
      status: "unauthenticated",
      authOpen: true,
    }),
}));

export const updateAuthenticatedSession = (
  authenticated: AuthenticatedSession
) => {
  useAuthStore.getState().setAuthenticated(authenticated);
};
