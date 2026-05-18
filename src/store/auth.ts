import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types";

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      setRole: (role) =>
        set((s) => (s.user ? { user: { ...s.user, role } } : s)),
    }),
    { name: "dispatch.auth" },
  ),
);
