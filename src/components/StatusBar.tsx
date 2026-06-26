import type { FileTab } from "../types";
import { formatSize } from "@/utils/format";

interface StatusBarProps {
  activeTab: FileTab | null;
  searchResultCount: number;
  isDark: boolean;
}

export function StatusBar({ activeTab, searchResultCount, isDark }: StatusBarProps) {
  return (
    <div
      className="flex items-center px-5 shrink-0 select-none gap-3"
      style={{
        height: "var(--statusbar-height)",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
        fontSize: 11,
        fontWeight: 500,
        color: "var(--text-tertiary)",
        lineHeight: 1,
      }}
    >
      {activeTab ? (
        <>
          {/* Format badge */}
          <span
            className="format-badge inline-flex items-center px-1.5 py-px rounded font-semibold tracking-wide uppercase"
            style={{
              fontSize: 9.5,
              background: "var(--accent-subtle)",
              color: "var(--accent)",
            }}
          >
            {activeTab.format}
          </span>

          <span className="status-dot" />

          {/* File size */}
          <span>{formatSize(activeTab.fileSize)}</span>

          <span className="status-dot" />

          {/* Path */}
          <span className="truncate max-w-[320px]" title={activeTab.path}>
            {activeTab.path}
          </span>

          {/* Search results */}
          {searchResultCount > 0 && (
            <>
              <span className="status-dot" />
              <span
                className="inline-flex items-center gap-1 px-1.5 py-px rounded font-semibold"
                style={{
                  fontSize: 9.5,
                  background: "rgba(240, 165, 0, 0.10)",
                  color: "var(--warning)",
                }}
              >
                {searchResultCount} matches
              </span>
            </>
          )}
        </>
      ) : (
        <span>jsonRs</span>
      )}

      <div className="flex-1" />

      {/* Theme indicator */}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="animate-breathe"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: isDark ? "var(--neon-pink)" : "var(--warning)",
            boxShadow: isDark
              ? "0 0 6px var(--neon-pink), 0 0 12px var(--accent-glow)"
              : "0 0 4px rgba(240, 165, 0, 0.3)",
          }}
        />
        {isDark ? "Dark" : "Light"}
      </span>
    </div>
  );
}