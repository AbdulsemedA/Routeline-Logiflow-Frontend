import { useEffect } from "react";
import { useUIStore } from "@/store/ui";

export function useThemeEffect() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
}
