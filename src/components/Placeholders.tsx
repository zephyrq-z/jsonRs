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
        style={{ maxWidth: 400 }}
      >
        {/* Braces icon — larger, breathing */}
        <div className="empty-state-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-tertiary)" }}
          >
            <path d="M22 10C17.58 10 14 13.58 14 18v8c0 3.31-2.69 6-6 6 3.31 0 6 2.69 6 6v8c0 4.42 3.58 8 8 8" />
            <path d="M42 10c4.42 0 8 3.58 8 8v8c0 3.31 2.69 6 6 6-3.31 0-6 2.69-6 6v8c0 4.42-3.58 8-8 8" />
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
          className="text-[18px] font-bold mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          jsonRs
        </div>
        <div
          className="text-[13px] leading-relaxed mb-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          JSON / XML desktop viewer
        </div>

        {/* Quick action cards */}
        <div className="flex gap-3 w-full max-w-[360px] mb-2">
          <div
            className="quick-action-card accent-card flex-1 flex flex-col items-center gap-2 px-3 py-4 rounded-lg text-[12px] font-semibold"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-glow)",
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json,.jsonl,.xml,.svg,.geojson,.html,.htm";
              input.onchange = () => { /* handled by toolbar */ };
              input.click();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4.5V12a1 1 0 001 1h10a1 1 0 001-1V6.5a1 1 0 00-1-1H7.5L6 4H3a1 1 0 00-1 1z" />
            </svg>
            <span>Open File</span>
            <kbd
              className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--surface-0)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              ⌘O
            </kbd>
          </div>

          <div
            className="quick-action-card flex-1 flex flex-col items-center gap-2 px-3 py-4 rounded-lg text-[12px] font-medium"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="2.5" width="8" height="9" rx="1" />
              <path d="M5.5 2.5V1.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1" />
              <path d="M5.5 5.5h5M5.5 8.5h5" />
            </svg>
            <span>Paste</span>
            <kbd
              className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--surface-0)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              ⌘V
            </kbd>
          </div>

          <div
            className="quick-action-card flex-1 flex flex-col items-center gap-2 px-3 py-4 rounded-lg text-[12px] font-medium"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l4 4-4 4" />
              <path d="M9 3l4 4-4 4" />
            </svg>
            <span>Drop</span>
            <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>Drag & drop</span>
          </div>
        </div>

        {/* Recent files */}
        {recentFiles && recentFiles.length > 0 && (
          <div className="mt-5 w-full max-w-[360px]">
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
                  className="quick-action-card flex items-center gap-2 px-3 py-2 rounded-md text-[12px]"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => onOpenRecent?.(f.path)}
                  title={f.path}
                >
                  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                    <path d="M9 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9 1.5z" />
                    <path d="M9 1.5V5.5h4" />
                  </svg>
                  <span className="truncate flex-1 text-left">{f.name}</span>
                  <span
                    className="text-[10px] uppercase font-semibold shrink-0"
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
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full" style={{ color: "var(--text-tertiary)" }}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Skeleton lines */}
        <div className="space-y-2 w-[280px]">
          <div className="skeleton" style={{ height: 14, width: "60%" }} />
          <div className="skeleton" style={{ height: 14, width: "85%" }} />
          <div className="skeleton" style={{ height: 14, width: "45%" }} />
          <div className="skeleton" style={{ height: 14, width: "70%" }} />
          <div className="skeleton" style={{ height: 14, width: "55%" }} />
          <div className="skeleton" style={{ height: 14, width: "75%" }} />
          <div className="skeleton" style={{ height: 14, width: "40%" }} />
          <div className="skeleton" style={{ height: 14, width: "65%" }} />
        </div>
        <div className="flex items-center gap-2">
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="animate-spin">
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
    </div>
  );
}