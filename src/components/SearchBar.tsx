import { useState, useRef, useEffect } from "react";
import type { SearchOptions } from "../types";
import { useTooltip } from "../context/TooltipContext";
import { IconX, IconChevronUp, IconChevronDown, IconSearch } from "./Icons";

interface SearchBarProps {
  onSearch: (options: SearchOptions) => void;
  onClose: () => void;
  resultCount: number;
  currentIndex: number;
  onNavigate: (direction: "next" | "prev") => void;
}

function ToggleButton({
  active,
  onClick,
  tooltip,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}) {
  const { show, hide } = useTooltip();

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => show(tooltip, e)}
      onMouseLeave={hide}
      className="flex items-center justify-center rounded transition-all duration-150"
      style={{
        width: 26,
        height: 26,
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        fontFamily: "var(--font-mono)",
        color: active ? "var(--accent)" : "var(--text-tertiary)",
        background: active ? "var(--accent-subtle)" : "transparent",
        border: active ? "1px solid var(--accent)" : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

export function SearchBar({ onSearch, onClose, resultCount, currentIndex, onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { show, hide } = useTooltip();

  const paramsRef = useRef({ query, caseSensitive, useRegex, wholeWord });
  paramsRef.current = { query, caseSensitive, useRegex, wholeWord };

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      onSearchRef.current({
        query: paramsRef.current.query,
        caseSensitive: paramsRef.current.caseSensitive,
        useRegex: paramsRef.current.useRegex,
        wholeWord: paramsRef.current.wholeWord,
      });
    }, 250);
    return () => clearTimeout(id);
  }, [query, caseSensitive, useRegex, wholeWord]);

  return (
    <div
      className="flex items-center gap-2 px-4 shrink-0 animate-slide-in-right"
      style={{
        height: 36,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Input */}
      <div
        className="flex items-center gap-2 flex-1 rounded-md px-2.5 transition-all duration-150"
        style={{
          height: 28,
          background: "var(--surface-0)",
          border: "1px solid var(--border-default)",
        }}
      >
        <IconSearch width={13} height={13} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.shiftKey ? onNavigate("prev") : onNavigate("next");
            if (e.key === "Escape") onClose();
          }}
          placeholder="Search..."
          className="flex-1 bg-transparent outline-none text-[12px]"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-1">
        <ToggleButton active={caseSensitive} onClick={() => setCaseSensitive((p) => !p)} tooltip="Case sensitive">
          Aa
        </ToggleButton>
        <ToggleButton active={wholeWord} onClick={() => setWholeWord((p) => !p)} tooltip="Whole word">
          W
        </ToggleButton>
        <ToggleButton active={useRegex} onClick={() => setUseRegex((p) => !p)} tooltip="Regex">
          .*
        </ToggleButton>
      </div>

      {/* Result count */}
      <span
        className="text-[11px] tabular-nums shrink-0 min-w-[52px] text-right font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        {resultCount > 0
          ? `${currentIndex + 1} / ${resultCount}`
          : query
            ? "0"
            : ""}
      </span>

      {/* Nav */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onNavigate("prev")}
          onMouseEnter={(e) => show("Previous match (Shift+Enter)", e)}
          onMouseLeave={hide}
          className="flex items-center justify-center rounded transition-colors toolbar-btn"
          style={{ width: 22, height: 22, color: "var(--text-tertiary)" }}
        >
          <IconChevronUp width={14} height={14} />
        </button>
        <button
          onClick={() => onNavigate("next")}
          onMouseEnter={(e) => show("Next match (Enter)", e)}
          onMouseLeave={hide}
          className="flex items-center justify-center rounded transition-colors toolbar-btn"
          style={{ width: 22, height: 22, color: "var(--text-tertiary)" }}
        >
          <IconChevronDown width={14} height={14} />
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        onMouseEnter={(e) => show("Close search (Esc)", e)}
        onMouseLeave={hide}
        className="flex items-center justify-center rounded transition-colors toolbar-btn"
        style={{ width: 22, height: 22, color: "var(--text-tertiary)" }}
      >
        <IconX width={13} height={13} />
      </button>
    </div>
  );
}