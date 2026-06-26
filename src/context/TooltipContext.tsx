import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface TooltipState {
  text: string;
  x: number;
  y: number;
}

interface TooltipContextValue {
  show: (text: string, e: React.MouseEvent | MouseEvent) => void;
  hide: () => void;
}

const TooltipContext = createContext<TooltipContextValue>({
  show: () => {},
  hide: () => {},
});

export function useTooltip(): TooltipContextValue {
  return useContext(TooltipContext);
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const show = useCallback((text: string, e: React.MouseEvent | MouseEvent) => {
    posRef.current = { x: e.clientX, y: e.clientY };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setTooltip({ text, x: posRef.current.x, y: posRef.current.y });
    }, 400);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ show, hide }}>
      {children}
      {tooltip &&
        createPortal(
          <FloatingTooltip text={tooltip.text} x={tooltip.x} y={tooltip.y} />,
          document.body,
        )}
    </TooltipContext.Provider>
  );
}

function FloatingTooltip({ text, x, y }: { text: string; x: number; y: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [adjustedX, setAdjustedX] = useState(x);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    if (x + rect.width + 12 > vw) {
      setAdjustedX(vw - rect.width - 12);
    } else {
      setAdjustedX(x + 12);
    }
  }, [x, text]);

  return (
    <div
      ref={ref}
      className="floating-tooltip"
      style={{
        left: adjustedX,
        top: y + 16,
      }}
    >
      {text}
    </div>
  );
}