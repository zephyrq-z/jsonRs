import { useRef, useEffect, useState, useCallback } from "react";
import type { FileTab, SearchResult, RecentFile } from "../types";
import { formatSize } from "@/utils/format";

interface SidePanelProps {
  tab: FileTab;
  searchResults: SearchResult[];
  onSearchResultClick: (line: number) => void;
  recentFiles?: RecentFile[];
  onOpenRecent?: (path: string) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="sidebar-section-title">
      {children}
    </h3>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-0.5">
      <span className="text-[11px] shrink-0" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="text-[11px] truncate text-right font-medium" style={{ color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}

export function SidePanel({ tab, searchResults, onSearchResultClick }: SidePanelProps) {
  const asideRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = asideRef.current;
    if (!el) return;
    setShowTopShadow(el.scrollTop > 4);
    setShowBottomShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, tab, searchResults]);

  return (
    <aside
      ref={asideRef}
      className="shrink-0 overflow-y-auto select-none"
      style={{
        width: 210,
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
        position: "relative",
      }}
    >
      {/* Scroll shadow top */}
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: showTopShadow
            ? "linear-gradient(to bottom, var(--surface-1), transparent)"
            : "transparent",
          pointerEvents: "none",
          zIndex: 2,
          transition: "background 0.2s ease",
        }}
      />

      {/* File info */}
      <div className="sidebar-section">
        <SectionTitle>File Info</SectionTitle>
        <div className="space-y-0.5">
          <InfoRow label="Name" value={tab.name} />
          <InfoRow label="Format" value={tab.format.toUpperCase()} />
          <InfoRow label="Size" value={formatSize(tab.fileSize)} />
          {tab.path !== "clipboard" && (
            <div className="pt-1.5">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Path</span>
              <div
                className="text-[11px] mt-0.5 break-all leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
                title={tab.path}
              >
                {tab.path}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View mode */}
      <div className="sidebar-section">
        <SectionTitle>View</SectionTitle>
        <span
          className="inline-flex items-center text-[11px] px-2 py-1 rounded font-medium"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
          }}
        >
          {tab.viewMode === "tree" ? "Tree" : "Text"}
        </span>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="sidebar-section">
          <SectionTitle>
            Results
            <span className="ml-1 font-normal normal-case tracking-normal">
              ({searchResults.length})
            </span>
          </SectionTitle>
          <div className="space-y-0.5 max-h-[40vh] overflow-y-auto">
            {searchResults.slice(0, 100).map((r, i) => (
              <div
                key={i}
                className="text-[11px] px-1.5 py-1 rounded truncate cursor-pointer transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                onClick={() => onSearchResultClick(r.line)}
                title={`Line ${r.line}: ${r.context}`}
              >
                <span className="tabular-nums font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {r.line}:{r.column}
                </span>
                {" "}
                <span className="truncate">{r.context.slice(0, 40)}</span>
              </div>
            ))}
            {searchResults.length > 100 && (
              <div className="text-[10px] py-1 font-medium" style={{ color: "var(--text-placeholder)" }}>
                +{searchResults.length - 100} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shortcuts */}
      <div className="sidebar-section">
        <SectionTitle>Shortcuts</SectionTitle>
        <div className="space-y-1 text-[11px]">
          {[
            ["Open", "⌘O"],
            ["Search", "⌘F"],
            ["Go to line", "⌘G"],
            ["Close tab", "⌘W"],
            ["Theme", "⌘⇧T"],
          ].map(([label, key]) => (
            <div key={key} className="flex justify-between items-center">
              <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
              <kbd
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll shadow bottom */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: showBottomShadow
            ? "linear-gradient(to top, var(--surface-1), transparent)"
            : "transparent",
          pointerEvents: "none",
          zIndex: 2,
          transition: "background 0.2s ease",
        }}
      />
    </aside>
  );
}

