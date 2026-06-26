import { useState, useRef, useEffect, useCallback } from "react";
import type { FC } from "react";

export interface PasteDialogProps {
  onConfirm: (text: string) => void;
  onClose: () => void;
}

export const PasteDialog: FC<PasteDialogProps> = ({ onConfirm, onClose }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed) onConfirm(trimmed);
  }, [text, onConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleConfirm();
      }
      if (e.key === "Escape" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onClose();
      }
    },
    [handleConfirm, onClose],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const isValid = text.trim().length > 0;

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-panel" style={{ width: 560, maxWidth: "90vw" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2
            className="text-[13px] font-semibold select-none"
            style={{ color: "var(--text-primary)" }}
          >
            Paste JSON / XML
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 24,
              height: 24,
              color: "var(--text-tertiary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <div className="px-5 py-5">
          <textarea
            ref={textareaRef}
            className="paste-textarea w-full"
            style={{ minHeight: 200, padding: "12px 14px" }}
            placeholder="Paste your JSON or XML content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
          <p
            className="mt-2.5 text-[11px] select-none"
            style={{ color: "var(--text-tertiary)" }}
          >
            Press <kbd
              className="inline-block px-1 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              ⌘+Enter
            </kbd>{" "}
            to confirm, <kbd
              className="inline-block px-1 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Esc
            </kbd>{" "}
            to cancel
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              color: "var(--text-secondary)",
              background: "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-4 py-1.5 rounded-md text-[12px] font-medium transition-all"
            style={{
              color: isValid ? "#fff" : "var(--text-tertiary)",
              background: isValid ? "var(--accent)" : "var(--surface-2)",
              cursor: isValid ? "pointer" : "not-allowed",
              opacity: isValid ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (isValid) e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (isValid) e.currentTarget.style.background = "var(--accent)";
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};