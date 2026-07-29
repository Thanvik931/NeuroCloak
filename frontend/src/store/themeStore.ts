import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem('neurocloak_theme') as 'dark' | 'light';
  if (saved) return saved;
  return 'dark';
};

const applyThemeToDOM = (theme: 'dark' | 'light') => {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

// Ensure the document reflects the saved theme on initial load so Tailwind
// classes that depend on `html.light` / `html.dark` cascade correctly.
if (typeof document !== 'undefined') {
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  sidebarOpen: false,
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('neurocloak_theme', nextTheme);
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),
  setTheme: (theme) => {
    localStorage.setItem('neurocloak_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));

