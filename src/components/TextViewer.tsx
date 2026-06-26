import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SearchResult } from "../types";

interface TextViewerProps {
  content: string;
  showLineNumbers: boolean;
  searchResults: SearchResult[];
  activeSearchIndex: number;
  wordWrap?: boolean;
  horizontalScroll?: boolean;
}

export interface TextViewerHandle {
  scrollToLine: (line: number) => void;
}

export const TextViewer = forwardRef<TextViewerHandle, TextViewerProps>(function TextViewer(
  {
    content,
    showLineNumbers,
    searchResults,
    activeSearchIndex,
    wordWrap = false,
    horizontalScroll = false,
  },
  ref,
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => content.split("\n"), [content]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, Array<{ start: number; end: number; active: boolean }>>();
    searchResults.forEach((r, i) => {
      if (!map.has(r.line)) map.set(r.line, []);
      map.get(r.line)!.push({
        start: r.match_start,
        end: r.match_end,
        active: i === activeSearchIndex,
      });
    });
    return map;
  }, [searchResults, activeSearchIndex]);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 22,
    overscan: 30,
  });

  // Expose scrollToLine to parent
  useImperativeHandle(ref, () => ({
    scrollToLine(line: number) {
      virtualizer.scrollToIndex(line - 1, { align: "center" });
    },
  }), [virtualizer]);

  // Auto-scroll to the active search result
  useEffect(() => {
    if (searchResults.length > 0 && activeSearchIndex < searchResults.length) {
      const activeLine = searchResults[activeSearchIndex].line;
      virtualizer.scrollToIndex(activeLine - 1, { align: "center" });
    }
  }, [activeSearchIndex, searchResults, virtualizer]);

  const renderLine = (text: string, lineNum: number) => {
    const marks = highlightMap.get(lineNum);
    if (!marks?.length) return text || " ";

    const sorted = [...marks].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let cursor = 0;

    for (const m of sorted) {
      if (m.start > cursor) parts.push(text.slice(cursor, m.start));
      parts.push(
        <span key={m.start} className={m.active ? "hl-match-active" : "hl-match"}>
          {text.slice(m.start, m.end)}
        </span>,
      );
      cursor = m.end;
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return <>{parts}</>;
  };

  // Calculate gutter width based on max line number digits
  const gutterDigits = String(lines.length).length;
  const gutterWidth = Math.max(gutterDigits * 8 + 16, 48);

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto px-6"
      style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: horizontalScroll ? "max-content" : "100%",
          minWidth: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((row) => {
          const lineNum = row.index + 1;
          const text = lines[row.index] ?? "";
          return (
            <div
              key={row.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: horizontalScroll ? "max-content" : "100%",
                minWidth: "100%",
                height: row.size,
                transform: `translateY(${row.start}px)`,
              }}
              className={`flex items-center ${wordWrap ? "flex-wrap whitespace-pre-wrap" : "whitespace-pre"}`}
            >
              {showLineNumbers && (
                <span
                  className="shrink-0 text-right select-none"
                  style={{
                    width: gutterWidth,
                    paddingRight: 12,
                    color: "var(--text-placeholder)",
                    borderRight: "1px solid var(--border-subtle)",
                    fontSize: 12,
                  }}
                >
                  {lineNum}
                </span>
              )}
              <span
                className="pl-4 pr-4 flex-1"
                style={{
                  lineHeight: "22px",
                  minWidth: horizontalScroll ? "max-content" : undefined,
                }}
              >
                {renderLine(text, lineNum)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});