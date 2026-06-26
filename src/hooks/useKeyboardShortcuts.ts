import { useEffect } from "react";

interface ShortcutHandlers {
  onOpenFile: () => void;
  onToggleSearch: () => void;
  onToggleTheme: () => void;
  onCloseCurrentTab: () => void;
  onGoToLine: () => void;
  onCloseSearch: () => void;
  activeTabId: string | null;
}

export function useKeyboardShortcuts({
  onOpenFile,
  onToggleSearch,
  onToggleTheme,
  onCloseCurrentTab,
  onGoToLine,
  onCloseSearch,
  activeTabId,
}: ShortcutHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "o") {
        e.preventDefault();
        onOpenFile();
      } else if (meta && e.key === "f") {
        e.preventDefault();
        onToggleSearch();
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        onToggleTheme();
      } else if (meta && e.key === "g") {
        e.preventDefault();
        onGoToLine();
      } else if (e.key === "Escape") {
        onCloseSearch();
      } else if (meta && e.key === "w" && activeTabId) {
        e.preventDefault();
        onCloseCurrentTab();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenFile, onToggleSearch, onToggleTheme, onCloseCurrentTab, onGoToLine, onCloseSearch, activeTabId]);
}