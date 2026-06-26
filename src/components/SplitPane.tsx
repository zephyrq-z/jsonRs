import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  defaultSplit?: number; // percentage 0-100
  minLeft?: number; // px
  minRight?: number; // px
}

export function SplitPane({
  left,
  right,
  defaultSplit = 50,
  minLeft = 200,
  minRight = 200,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(defaultSplit);
  const [dragging, setDragging] = useState(false);
  const rafRef = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const total = rect.width;
        const x = e.clientX - rect.left;
        const pct = Math.max(
          (minLeft / total) * 100,
          Math.min(((total - minRight) / total) * 100, (x / total) * 100),
        );
        setSplit(pct);
      });
    };

    const onMouseUp = () => {
      setDragging(false);
      cancelAnimationFrame(rafRef.current);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, minLeft, minRight]);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
      {/* Left pane */}
      <div className="overflow-hidden" style={{ width: `${split}%` }}>
        {left}
      </div>

      {/* Divider */}
      <div
        className="shrink-0 relative z-10 transition-colors"
        style={{
          width: 4,
          cursor: "col-resize",
          background: dragging ? "var(--accent)" : "var(--border-subtle)",
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={(e) => {
          if (!dragging) e.currentTarget.style.background = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          if (!dragging) e.currentTarget.style.background = "var(--border-subtle)";
        }}
      >
        {/* Handle grip */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 2,
            height: 32,
            borderRadius: 1,
            background: dragging ? "rgba(255,255,255,0.4)" : "var(--border-strong)",
          }}
        />
      </div>

      {/* Right pane */}
      <div className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}