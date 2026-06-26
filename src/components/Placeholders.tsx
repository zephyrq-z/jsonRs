import type { RecentFile } from "../types";

export function EmptyState({
  recentFiles,
  onOpenRecent,
}: {
  recentFiles?: RecentFile[];
  onOpenRecent?: (path: string) => void;
}) {
  return (
    <div className="empty-state flex items-center justify-center h-full select-none">
      <div
        className="flex flex-col items-center text-center animate-fade-in-up"
        style={{ maxWidth: 320 }}
      >
        {/* Braces icon */}
        <div className="empty-state-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-tertiary)" }}
          >
            {/* Left brace */}
            <path d="M22 10C17.58 10 14 13.58 14 18v8c0 3.31-2.69 6-6 6 3.31 0 6 2.69 6 6v8c0 4.42 3.58 8 8 8" />
            {/* Right brace */}
            <path d="M42 10c4.42 0 8 3.58 8 8v8c0 3.31 2.69 6 6 6-3.31 0-6 2.69-6 6v8c0 4.42-3.58 8-8 8" />
            {/* Center dots */}
            <circle cx="28" cy="20" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="28" cy="28" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="28" cy="36" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="28" cy="44" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="36" cy="20" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="36" cy="28" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="36" cy="36" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="36" cy="44" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <div
          className="text-[15px] font-semibold mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          jsonRs
        </div>
        <div
          className="text-[13px] leading-relaxed mb-5"
          style={{ color: "var(--text-tertiary)" }}
        >
          JSON / XML desktop viewer
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px]"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-glow)",
            }}
          >
            <kbd
              className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--surface-0)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                minWidth: 24,
              }}
            >
              ⌘O
            </kbd>
            <span>Open a file</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px]"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            <kbd
              className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--surface-0)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                minWidth: 24,
              }}
            >
              ⌘V
            </kbd>
            <span>Paste from clipboard</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px]"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>↗</span>
            <span>Drag & drop a file</span>
          </div>

        {/* Recent files */}
        {recentFiles && recentFiles.length > 0 && (
          <div className="mt-5 w-full max-w-[280px]">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-left"
              style={{ color: "var(--text-tertiary)" }}
            >
              Recent
            </div>
            <div className="space-y-0.5">
              {recentFiles.slice(0, 8).map((f) => (
                <div
                  key={f.path}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] cursor-pointer transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => onOpenRecent?.(f.path)}
                  title={f.path}
                >
                  <span className="truncate flex-1 text-left">{f.name}</span>
                  <span
                    className="text-[10px] uppercase font-medium shrink-0"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {f.format}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full" style={{ color: "var(--text-tertiary)" }}>
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <svg width={24} height={24} viewBox="0 0 16 16" fill="none" className="animate-spin">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
          <path
            d="M14 8a6 6 0 00-6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ color: "var(--accent)" }}
          />
        </svg>
        <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Loading...
        </span>
      </div>
    </div>
  );
}