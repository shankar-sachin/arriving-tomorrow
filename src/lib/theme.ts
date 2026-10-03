import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeChoice = "system" | "light" | "dark";

/** Must match the inline script in index.html, which applies the theme before first paint. */
export const THEME_KEY = "clothes-never-come-theme";

const THEME_COLOR = { light: "#fbf6ec", dark: "#140c26" } as const;

export const systemPrefersDark = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;

export const resolveTheme = (choice: ThemeChoice, systemDark: boolean): "light" | "dark" =>
  choice === "system" ? (systemDark ? "dark" : "light") : choice;

export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  const resolved = resolveTheme(choice, systemPrefersDark());
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[resolved]);
}

interface ThemeState {
  choice: ThemeChoice;
  set: (choice: ThemeChoice) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      choice: "system",
      set: (choice) => {
        set({ choice });
        applyTheme(choice);
      },
    }),
    { name: THEME_KEY },
  ),
);
