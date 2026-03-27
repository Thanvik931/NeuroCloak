import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('token');
const savedUserStr = localStorage.getItem('user');

let savedUser = null;
try {
  if (savedUserStr && savedUserStr !== 'undefined') {
    savedUser = JSON.parse(savedUserStr);
  }
} catch (e) {
  console.error("Failed to parse user from localStorage", e);
  localStorage.removeItem('user');
}

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser,
  token: savedToken,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

window.addEventListener('auth-logout', () => {
  useAuthStore.getState().logout();
});
