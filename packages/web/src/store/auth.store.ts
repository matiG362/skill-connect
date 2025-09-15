import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
interface User { sub: number; email: string; }
interface AuthState { token: string | null; user: User | null; isAuthenticated: boolean; }
interface AuthActions { setToken: (token: string) => void; clearAuth: () => void; }
const initialState: AuthState = { token: null, user: null, isAuthenticated: false };
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      setToken: (token) => {
        const decodedUser = jwtDecode<User>(token);
        set({ token: token, user: decodedUser, isAuthenticated: true });
      },
      clearAuth: () => set(initialState),
    }),
    { name: 'auth-storage' },
  ),
);
