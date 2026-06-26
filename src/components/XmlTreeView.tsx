import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { XmlElement } from "../types";
import { IconChevronRight } from "./Icons";
import { useTooltip } from "../context/TooltipContext";
import { useToast } from "../context/ToastContext";
interface XmlTreeViewProps {
  elements: XmlElement[];
  expandSignal?: number;
  wordWrap?: boolean;
  highlightQuery?: string;
  onOpenSubtree?: (xmlText: string) => void;
}

/* ── Flattened item types ─────────────────────────────── */

interface FlatXmlItem {
  type: "node" | "closing";
  element: XmlElement;
  depth: number;
}

/* ── Flatten tree respecting expanded state ────────────── */

function flattenXmlTree(
  elements: XmlElement[],
  expanded: Set<string>,
  depth: number,
): FlatXmlItem[] {
  const result: FlatXmlItem[] = [];
  for (const el of elements) {
    result.push({ type: "node", element: el, depth });
    const hasChildren = el.children.length > 0 || el.text;
    if (el.is_expandable && hasChildren && expanded.has(el.id)) {
      result.push(...flattenXmlTree(el.children, expanded, depth + 1));
      if (el.node_type === "element") {
        result.push({ type: "closing", element: el, depth });
      }
    }
  }
  return result;
}

/* ── Serialize XML subtree to string ───────────────────── */

function serializeXmlSubtree(el: XmlElement): string {
  function build(el: XmlElement, indent: number): string {
    const pad = "  ".repeat(indent);
    if (el.node_type === "comment") return `${pad}<!-- ${el.text} -->`;
    if (el.node_type === "cdata") return `${pad}<![CDATA[${el.text}]]>`;
    if (el.node_type === "declaration") {
      const attrs = Object.entries(el.attributes).map(([k, v]) => `${k}="${v}"`).join(" ");
      return `${pad}<?${el.tag}${attrs ? " " + attrs : ""}?>`;
    }
    const attrs = Object.entries(el.attributes).map(([k, v]) => ` ${k}="${v}"`).join("");
    if (el.children.length === 0 && !el.text) {
      return `${pad}<${el.tag}${attrs} />`;
    }
    if (el.children.length === 0 && el.text) {
      return `${pad}<${el.tag}${attrs}>${el.text}</${el.tag}>`;
    }
    const children = el.children.map((c) => build(c, indent + 1)).join("\n");
    const text = el.text ? el.text : "";
    return `${pad}<${el.tag}${attrs}>${text}\n${children}\n${pad}</${el.tag}>`;
  }
  return build(el, 0);
}

/* ── Highlight matching text ────────────────────────────── */

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(q, cursor);
  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <span key={idx} className="hl-match">
        {text.slice(idx, idx + q.length)}
      </span>,
    );
    cursor = idx + q.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? <>{parts}</> : text;
}

const ESTIMATED_ROW_HEIGHT = 22;

function Attrs({ attrs, highlightQuery }: { attrs: Record<string, string>; highlightQuery?: string }) {
  return (
    <>
      {Object.entries(attrs).map(([k, v]) => (
        <span key={k}>
          {" "}
          <span style={{ color: "var(--xml-attr)" }}>{highlightQuery ? highlightMatches(k, highlightQuery) : k}</span>
          <span style={{ color: "var(--text-tertiary)" }}>=</span>
          <span style={{ color: "var(--xml-value)" }}>"{highlightQuery ? highlightMatches(v, highlightQuery) : v}"</span>
        </span>
      ))}
    </>
  );
}

export function XmlTreeView({ elements, expandSignal = 0, wordWrap = false, highlightQuery, onOpenSubtree }: XmlTreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    function collect(els: XmlElement[], d: number) {
      for (const el of els) {
        if (d < 2 && el.is_expandable && (el.children.length > 0 || el.text)) {
          initial.add(el.id);
          if (el.children.length > 0) collect(el.children, d + 1);
        }
      }
    }
    collect(elements, 0);
    return initial;
  });

  const [copiedState, setCopiedState] = useState<string | null>(null);

  useEffect(() => {
    if (expandSignal > 0) {
      const all = new Set<string>();
      function collect(els: XmlElement[]) {
        for (const el of els) {
          if (el.is_expandable && (el.children.length > 0 || el.text)) {
            all.add(el.id);
            if (el.children.length > 0) collect(el.children);
          }
        }
      }
      collect(elements);
      setExpanded(all);
    } else if (expandSignal < 0) {
      setExpanded(new Set());
    }
  }, [expandSignal, elements]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const flatItems = useMemo(
    () => flattenXmlTree(elements, expanded, 0),
    [elements, expanded],
  );

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 30,
    measureElement: wordWrap
      ? (el) => {
          const h = el.getBoundingClientRect().height;
          return h > 0 ? h : ESTIMATED_ROW_HEIGHT;
        }
      : undefined,
  });

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const totalLines = flatItems.length;
  const lineDigits = String(totalLines).length;
  const lineNumWidth = Math.max(lineDigits * 8 + 16, 40);

  const contentClass = `tree-row-content${!wordWrap ? " nowrap" : ""}`;

  if (elements.length === 0) {
    return (
      <div className="h-full overflow-auto px-6" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <div className="text-center py-12" style={{ color: "var(--text-placeholder)" }}>
          Empty document
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto px-6"
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
          const item = flatItems[row.index];
          if (!item) return null;
          const { element: el, depth } = item;
          const lineNum = row.index + 1;
          const indent = depth * 20;

          if (item.type === "closing") {
            return (
              <div
                key={`${el.id}-close`}
                data-index={row.index}
                ref={wordWrap ? virtualizer.measureElement : undefined}
                className="tree-line"
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%",
                  minHeight: ESTIMATED_ROW_HEIGHT,
                  transform: `translateY(${row.start}px)`,
                }}
              >
                <LineNum num={lineNum} width={lineNumWidth} />
                <span className={contentClass}>
                  <span style={{ paddingLeft: indent }} />
                  <span style={{ color: "var(--xml-tag)" }}>
                    {"</"}{el.tag}{">"}
                  </span>
                </span>
              </div>
            );
          }

          const isExpanded = expanded.has(el.id);
          const hasChildren = el.children.length > 0 || el.text;
          const isExpandable = el.is_expandable && (hasChildren === true);

          return (
            <div
              key={el.id}
              data-index={row.index}
              ref={wordWrap ? virtualizer.measureElement : undefined}
              className="tree-line"
              style={{
                position: "absolute", top: 0, left: 0, width: "100%",
                minHeight: ESTIMATED_ROW_HEIGHT,
                transform: `translateY(${row.start}px)`,
                cursor: isExpandable ? "pointer" : undefined,
              }}
              onMouseEnter={() => setCopiedState(el.id)}
              onMouseLeave={() => setCopiedState(null)}
              onClick={() => isExpandable && toggleExpand(el.id)}
            >
              <LineNum num={lineNum} width={lineNumWidth} />

              {copiedState === el.id && el.node_type === "element" && (
                <XmlNodeActions
                  el={el}
                  copy={copy}
                  onOpenSubtree={onOpenSubtree}
                />
              )}

              <span className={contentClass}>
                {renderXmlNode(el, isExpanded, isExpandable, toggleExpand, highlightQuery)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Line number ───────────────────────────────────────── */

function LineNum({ num, width }: { num: number; width: number }) {
  return (
    <span
      className="shrink-0 text-right select-none"
      style={{
        width,
        paddingRight: 12,
        fontSize: 12,
        color: "var(--text-placeholder)",
        borderRight: "1px solid var(--border-subtle)",
        marginRight: 8,
      }}
    >
      {num}
    </span>
  );
}

/* ── XML node action buttons ────────────────────────────── */

function XmlNodeActions({
  el,
  copy,
  onOpenSubtree,
}: {
  el: XmlElement;
  copy: (text: string) => void;
  onOpenSubtree?: (xmlText: string) => void;
}) {
  const { show, hide } = useTooltip();
  const { show: showToast } = useToast();

  const doCopy = useCallback(
    (e: React.MouseEvent, text: string, label: string) => {
      e.stopPropagation();
      copy(text);
      showToast(`Copied ${label.toLowerCase()}`);
    },
    [copy, showToast],
  );

  const handleCopyTag = (e: React.MouseEvent) => doCopy(e, el.tag, "Tag");
  const handleCopyText = (e: React.MouseEvent) => {
    if (el.text) doCopy(e, el.text, "Text");
  };
  const handleCopyAll = (e: React.MouseEvent) => {
    const attrs = Object.entries(el.attributes).map(([k, v]) => ` ${k}="${v}"`).join("");
    if (el.text) {
      doCopy(e, `<${el.tag}${attrs}>${el.text}</${el.tag}>`, "All");
    } else {
      doCopy(e, `<${el.tag}${attrs} />`, "All");
    }
  };
  const handleOpenSubtree = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSubtree) onOpenSubtree(serializeXmlSubtree(el));
  };

  return (
    <span
      className="inline-flex items-center gap-0.5 mr-1 shrink-0"
      style={{
        position: "absolute",
        left: 4,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 5,
      }}
    >
      <XmlActionBtn
        label="Tag"
        onClick={handleCopyTag}
        onShow={show}
        onHide={hide}
        tooltip="Copy tag name"
      />
      {el.text && (
        <XmlActionBtn
          label="Text"
          onClick={handleCopyText}
          onShow={show}
          onHide={hide}
          tooltip="Copy text content"
        />
      )}
      <XmlActionBtn
        label="All"
        onClick={handleCopyAll}
        onShow={show}
        onHide={hide}
        tooltip="Copy full element"
      />
      {el.is_expandable && (
        <XmlActionBtn
          label="XML"
          onClick={handleOpenSubtree}
          onShow={show}
          onHide={hide}
          tooltip="Open subtree as XML"
        />
      )}
    </span>
  );
}

function XmlActionBtn({
  label,
  onClick,
  onShow,
  onHide,
  tooltip,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  onShow: (text: string, e: React.MouseEvent) => void;
  onHide: () => void;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => { e.stopPropagation(); onShow(tooltip, e); }}
      onMouseLeave={(e) => { e.stopPropagation(); onHide(); }}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded"
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "var(--accent)",
        background: "var(--accent-subtle)",
        border: "1px solid var(--accent-glow)",
        lineHeight: "14px",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.12s ease, color 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

/* ── Node rendering ────────────────────────────────────── */

function renderXmlNode(
  el: XmlElement,
  isExpanded: boolean,
  _isExpandable: boolean,
  toggleExpand: (id: string) => void,
  highlightQuery?: string,
): React.ReactNode {
  if (el.node_type === "comment") {
    return (
      <>
        <span className="gutter" />
        <span style={{ color: "var(--xml-comment)", fontStyle: "italic" }}>
          {"<!-- "}{highlightQuery && el.text ? highlightMatches(el.text, highlightQuery) : el.text}{" -->"}
        </span>
      </>
    );
  }

  if (el.node_type === "cdata") {
    return (
      <>
        <span className="gutter" />
        <span style={{ color: "var(--xml-cdata)" }}>
          {"<![CDATA["}{highlightQuery && el.text ? highlightMatches(el.text, highlightQuery) : el.text}{"]]>"}
        </span>
      </>
    );
  }

  if (el.node_type === "declaration") {
    return (
      <>
        <span style={{ color: "var(--xml-comment)" }}>
          {"<?"}{highlightQuery ? highlightMatches(el.tag, highlightQuery) : el.tag}
          <Attrs attrs={el.attributes} highlightQuery={highlightQuery} />
          {"?>"}
        </span>
      </>
    );
  }

  const hasChildren = el.children.length > 0 || el.text;

  if (!hasChildren) {
    return (
      <>
        <span className="gutter" />
        <span style={{ color: "var(--xml-tag)" }}>{"<"}</span>
        <span style={{ color: "var(--xml-tag)" }}>{highlightQuery ? highlightMatches(el.tag, highlightQuery) : el.tag}</span>
        <Attrs attrs={el.attributes} highlightQuery={highlightQuery} />
        <span style={{ color: "var(--xml-tag)" }}>{" />"}</span>
      </>
    );
  }

  if (isExpanded) {
    return (
      <>
        <span className="tree-chevron expanded" onClick={(e) => { e.stopPropagation(); toggleExpand(el.id); }}>
          <IconChevronRight width={12} height={12} />
        </span>
        <span style={{ color: "var(--xml-tag)" }}>{"<"}</span>
        <span style={{ color: "var(--xml-tag)" }}>{highlightQuery ? highlightMatches(el.tag, highlightQuery) : el.tag}</span>
        <Attrs attrs={el.attributes} highlightQuery={highlightQuery} />
        <span style={{ color: "var(--xml-tag)" }}>{">"}</span>
        {el.text && !el.children.length && (
          <span style={{ color: "var(--text-primary)", marginLeft: 4 }}>
            {highlightQuery ? highlightMatches(el.text, highlightQuery) : el.text}
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <span className="tree-chevron">
        <IconChevronRight width={12} height={12} />
      </span>
      <span style={{ color: "var(--xml-tag)" }}>{"<"}</span>
      <span style={{ color: "var(--xml-tag)" }}>{highlightQuery ? highlightMatches(el.tag, highlightQuery) : el.tag}</span>
      <Attrs attrs={el.attributes} highlightQuery={highlightQuery} />
      <span style={{ color: "var(--xml-tag)" }}>{">"}</span>
      <span className="mx-1.5" style={{ color: "var(--text-placeholder)" }}>
        {el.children.length} children
      </span>
      <span style={{ color: "var(--xml-tag)" }}>
        {"</"}{highlightQuery ? highlightMatches(el.tag, highlightQuery) : el.tag}{">"}
      </span>
    </>
  );
}