// store/authStore.ts
import { create } from "zustand";
import { UserSession } from "@/types/authTypes";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: UserSession | null;
  authOpen: boolean;
  status: AuthStatus;
  setUser: (user: UserSession) => void;
  setStatus: (status: AuthStatus) => void;
  setAuthOpen: (open: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authOpen: false,
  status: "loading",
  setUser: (user) => set({ user, status: "authenticated" }),
  setStatus: (status) => set({ status }),
  setAuthOpen: (open) => set({ authOpen: open }),
  clearSession: () => set({ user: null, status: "unauthenticated", authOpen: true }),
}));

export const updateUserSession = (userSession: UserSession) => {
  const { setUser } = useAuthStore.getState();
  setUser(userSession);
}