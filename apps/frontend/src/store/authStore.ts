// store/authStore.ts
import { create } from "zustand";
import { UserSession } from "@/types/authTypes";

type AuthState = {
  user: UserSession | null;
  authOpen: boolean;
  setUser: (user: UserSession) => void;
  setAuthOpen: (open: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authOpen: false,
  setUser: (user) => set({ user }),
  setAuthOpen: (open) => set({ authOpen: open }),
  clearSession: () => set({ user: null}), // expire session → show overlay
}));

export const updateUserSession = (userSession: UserSession) => {
  const { setUser } = useAuthStore.getState();
  setUser(userSession);
}