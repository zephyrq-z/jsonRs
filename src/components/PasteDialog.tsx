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
      <div className="dialog-panel rgb-border" style={{ width: 640, maxWidth: "92vw" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5"
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
        <div className="px-8 py-6">
          <textarea
            ref={textareaRef}
            className="paste-textarea w-full neon-glow-hover"
            style={{ minHeight: 300, padding: "16px 18px" }}
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
          className="flex items-center justify-end gap-2 px-8 py-5"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-1.5 text-[12px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="btn-primary px-4 py-1.5 text-[12px]"
            style={{
              opacity: isValid ? 1 : 0.4,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};