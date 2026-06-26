import { useState, useRef, useEffect, useCallback } from "react";

interface GoToLineDialogProps {
  maxLine: number;
  onGoTo: (line: number) => void;
  onClose: () => void;
}

export function GoToLineDialog({ maxLine, onGoTo, onClose }: GoToLineDialogProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const num = parseInt(value, 10);
    if (num >= 1 && num <= maxLine) {
      onGoTo(num);
      onClose();
    }
  }, [value, maxLine, onGoTo, onClose]);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-panel p-4"
        style={{ width: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-[12px] font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Go to line
        </div>
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={maxLine}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          placeholder={`1 – ${maxLine}`}
          className="w-full rounded-md px-2.5 py-2 text-[13px] outline-none transition-all duration-150"
          style={{
            background: "var(--surface-1)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            fontFamily: "var(--font-mono)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] rounded-md font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 text-[12px] rounded-md font-medium transition-all"
            style={{ background: "var(--accent)", color: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}