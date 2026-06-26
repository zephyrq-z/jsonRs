import { useMemo, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { IconOpenJson } from "./Icons";

/* ── Types ─────────────────────────────────────────────── */

interface JsonlLine {
  line_number: number;
  content: string;
  preview: string;
  valid: boolean;
}

interface JsonlViewerProps {
  content: string;
  onOpenLine: (jsonText: string, lineNumber: number) => void;
}

/* ── Parse JSONL content ───────────────────────────────── */

function parseJsonlLines(content: string): JsonlLine[] {
  return content.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      const preview = JSON.stringify(parsed);
      const display = preview.length > 80 ? preview.slice(0, 80) + "…" : preview;
      return {
        line_number: i + 1,
        content: trimmed,
        preview: display,
        valid: true,
      };
    } catch {
      return {
        line_number: i + 1,
        content: trimmed,
        preview: trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed,
        valid: false,
      };
    }
  }).filter(Boolean) as JsonlLine[];
}

const ESTIMATED_ROW_HEIGHT = 28;

/* ── Main component ────────────────────────────────────── */

export function JsonlViewer({ content, onOpenLine }: JsonlViewerProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => parseJsonlLines(content), [content]);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 30,
  });

  const handleOpen = useCallback(
    (line: JsonlLine) => {
      onOpenLine(line.content, line.line_number);
    },
    [onOpenLine],
  );

  const lineDigits = String(lines.length).length;
  const lineNumWidth = Math.max(lineDigits * 8 + 16, 48);

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const line = lines[row.index];
          if (!line) return null;

          return (
            <div
              key={line.line_number}
              data-index={row.index}
              className="jsonl-line"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: ESTIMATED_ROW_HEIGHT,
                transform: `translateY(${row.start}px)`,
              }}
            >
              {/* Line number */}
              <span
                className="shrink-0 text-right select-none"
                style={{
                  width: lineNumWidth,
                  paddingRight: 12,
                  fontSize: 12,
                  color: line.valid ? "var(--text-placeholder)" : "var(--danger)",
                  borderRight: "1px solid var(--border-subtle)",
                  marginRight: 8,
                }}
              >
                {line.line_number}
              </span>

              {/* Open button — always visible */}
              {line.valid ? (
                <button
                  className="shrink-0 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(line);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--accent-subtle)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--accent-glow)",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    lineHeight: "18px",
                  }}
                >
                  <IconOpenJson width={11} height={11} />
                  Open
                </button>
              ) : (
                <span className="shrink-0 mr-2" style={{ width: 56 }} />
              )}

              {/* Status indicator */}
              {line.valid ? (
                <span
                  className="shrink-0 mr-2"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--success)",
                    marginTop: 2,
                  }}
                />
              ) : (
                <span
                  className="shrink-0 mr-2 text-[10px] font-semibold"
                  style={{ color: "var(--danger)", marginTop: 1 }}
                >
                  !
                </span>
              )}

              {/* Preview */}
              <span
                className="truncate flex-1"
                style={{
                  color: line.valid ? "var(--text-secondary)" : "var(--danger)",
                  opacity: line.valid ? 1 : 0.7,
                }}
                title={line.valid ? line.preview : "Invalid JSON"}
              >
                {line.preview}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}