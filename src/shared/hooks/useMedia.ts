import { useSyncExternalStore } from "react";

function subscribe(callback: () => void, query: string): () => void {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useMedia(): { isDark: boolean; isMobile: boolean } {
  const isDark = useSyncExternalStore(
    (callback) => subscribe(callback, "(prefers-color-scheme: dark)"),
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

  const isMobile = useSyncExternalStore(
    (callback) => subscribe(callback, "(max-width: 768px)"),
    () => window.matchMedia("(max-width: 768px)").matches,
    () => false,
  );

  return { isDark, isMobile };
}
