import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  defaultSplit?: number;
  minLeft?: number;
  minRight?: number;
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
  const [hovering, setHovering] = useState(false);
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

  const isActive = dragging || hovering;

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
      {/* Left pane */}
      <div className="overflow-hidden" style={{ width: `${split}%` }}>
        {left}
      </div>

      {/* Divider */}
      <div
        className={`shrink-0 relative z-10 split-divider${isActive ? " active" : ""}`}
        style={{
          width: 6,
          cursor: "col-resize",
          background: isActive ? "var(--accent)" : "var(--border-subtle)",
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Grip dots */}
        <div className="split-divider-grip">
          <span className="split-divider-grip-dot" />
          <span className="split-divider-grip-dot" />
          <span className="split-divider-grip-dot" />
        </div>
      </div>

      {/* Right pane */}
      <div className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}