import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { JsonNode } from "../types";
import { IconChevronRight } from "./Icons";
import { useTooltip } from "../context/TooltipContext";
import { useToast } from "../context/ToastContext";
/* ── Types ─────────────────────────────────────────────── */

interface JsonTreeViewProps {
  nodes: JsonNode[];
  expandSignal?: number;
  wordWrap?: boolean;
  highlightQuery?: string;
  onOpenSubtree?: (jsonText: string) => void;
}

interface FlatItem {
  type: "node" | "closing";
  node: JsonNode;
  depth: number;
}

/* ── Flatten tree ──────────────────────────────────────── */

function flattenTree(nodes: JsonNode[], expanded: Set<string>, depth: number): FlatItem[] {
  const result: FlatItem[] = [];
  for (const node of nodes) {
    result.push({ type: "node", node, depth });
    if (node.is_expandable && expanded.has(node.id) && node.children) {
      result.push(...flattenTree(node.children, expanded, depth + 1));
      result.push({ type: "closing", node, depth });
    }
  }
  return result;
}

/* ── Serialize subtree ─────────────────────────────────── */

function serializeSubtree(node: JsonNode): string {
  function build(node: JsonNode): unknown {
    switch (node.value_type) {
      case "object":
        if (!node.children) return {};
        const obj: Record<string, unknown> = {};
        for (const child of node.children) {
          if (child.key) obj[child.key] = build(child);
        }
        return obj;
      case "array":
        if (!node.children) return [];
        return node.children.map(build);
      case "string":
        return node.value.replace(/^"|"$/g, "");
      case "number":
        return Number(node.value);
      case "boolean":
        return node.value === "true";
      case "null":
        return null;
      default:
        return node.value;
    }
  }
  return JSON.stringify(build(node), null, 2);
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

/* ── Constants ─────────────────────────────────────────── */

const ESTIMATED_ROW_HEIGHT = 22;
const INDENT_WIDTH = 20;

/* ── Indent Guides ──────────────────────────────────────── */

function IndentGuides({ depth, leftOffset }: { depth: number; leftOffset: number }) {
  if (depth <= 0) return null;
  return (
    <>
      {Array.from({ length: depth }, (_, i) => {
        const isLast = i === depth - 1;
        return (
          <span
            key={i}
            className={`tree-indent-guide${isLast ? " active" : ""}`}
            style={{
              left: leftOffset + 9 + i * INDENT_WIDTH,
              background: isLast ? "var(--accent-soft)" : "var(--border-default)",
            }}
          />
        );
      })}
    </>
  );
}

/* ── Value rendering ───────────────────────────────────── */

function renderValue(node: JsonNode, isExpanded: boolean, copy: (text: string) => void, highlightQuery?: string): React.ReactNode {
  const { value_type, value, child_count } = node;
  switch (value_type) {
    case "string":
      return (
        <span style={{ color: "var(--json-string)", cursor: "pointer" }} onDoubleClick={(e) => { e.stopPropagation(); copy(value.replace(/^"|"$/g, "")); }}>
          {highlightQuery ? highlightMatches(value, highlightQuery) : value}
        </span>
      );
    case "number":
      return <span style={{ color: "var(--json-number)" }}>{value}</span>;
    case "boolean":
      return <span style={{ color: "var(--json-boolean)" }}>{value}</span>;
    case "null":
      return <span style={{ color: "var(--json-null)", fontStyle: "italic" }}>null</span>;
    case "object":
      if (isExpanded) {
        return (
          <>
            <span style={{ color: "var(--json-bracket)" }}>{"{"}</span>
            <span className="ml-2 text-[11px]" style={{ color: "var(--text-placeholder)", userSelect: "none" }}>{child_count} keys</span>
          </>
        );
      }
      return (
        <>
          <span style={{ color: "var(--json-bracket)" }}>{"{"}</span>
          <span className="mx-1.5" style={{ color: "var(--text-placeholder)" }}>{child_count} keys</span>
          <span style={{ color: "var(--json-bracket)" }}>{"}"}</span>
        </>
      );
    case "array":
      if (isExpanded) {
        return (
          <>
            <span style={{ color: "var(--json-bracket)" }}>{"["}</span>
            <span className="ml-2 text-[11px]" style={{ color: "var(--text-placeholder)", userSelect: "none" }}>{child_count} items</span>
          </>
        );
      }
      return (
        <>
          <span style={{ color: "var(--json-bracket)" }}>{"["}</span>
          <span className="mx-1.5" style={{ color: "var(--text-placeholder)" }}>{child_count} items</span>
          <span style={{ color: "var(--json-bracket)" }}>{"]"}</span>
        </>
      );
    default:
      return <span>{value}</span>;
  }
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

/* ── Action button ─────────────────────────────────────── */

function ActionBtn({
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
        transition: "background 0.12s ease, color 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

/* ── Node action buttons ───────────────────────────────── */

function NodeActions({
  node,
  copy,
  onOpenSubtree,
}: {
  node: JsonNode;
  copy: (text: string) => void;
  onOpenSubtree?: (jsonText: string) => void;
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
      {node.key !== null && (
        <ActionBtn label="Key" onClick={(e) => { if (node.key) doCopy(e, node.key, "Key"); }} onShow={show} onHide={hide} tooltip="Copy key" />
      )}
      <ActionBtn label="Value" onClick={(e) => {
        const raw = node.value_type === "string" ? node.value.replace(/^"|"$/g, "") : node.value;
        doCopy(e, raw, "Value");
      }} onShow={show} onHide={hide} tooltip="Copy value" />
      <ActionBtn label="All" onClick={(e) => {
        if (node.key !== null) doCopy(e, `"${node.key}": ${node.value}`, "All");
        else doCopy(e, node.value, "All");
      }} onShow={show} onHide={hide} tooltip="Copy key: value" />
      {node.is_expandable && (
        <ActionBtn label="JSON" onClick={(e) => { e.stopPropagation(); if (onOpenSubtree) onOpenSubtree(serializeSubtree(node)); }} onShow={show} onHide={hide} tooltip="Open subtree as JSON" />
      )}
    </span>
  );
}

/* ── Main component ────────────────────────────────────── */

export function JsonTreeView({ nodes, expandSignal = 0, wordWrap = false, highlightQuery, onOpenSubtree }: JsonTreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    function addIds(list: JsonNode[], maxDepth = 0) {
      for (const n of list) {
        if (n.is_expandable && maxDepth < 2) { s.add(n.id); if (n.children) addIds(n.children, maxDepth + 1); }
      }
    }
    addIds(nodes);
    return s;
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (expandSignal > 0) {
      const s = new Set<string>();
      function addAll(list: JsonNode[]) { for (const n of list) { if (n.is_expandable) { s.add(n.id); if (n.children) addAll(n.children); } } }
      addAll(nodes); setExpanded(s);
    } else if (expandSignal < 0) {
      setExpanded(new Set());
    }
  }, [expandSignal, nodes]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const flatItems = useMemo(() => flattenTree(nodes, expanded, 0), [nodes, expanded]);

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

  if (nodes.length === 0) {
    return (
      <div className="h-full overflow-auto px-6" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <div className="text-center py-12" style={{ color: "var(--text-placeholder)" }}>Empty document</div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto px-6" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {virtualizer.getVirtualItems().map((row) => {
          const item = flatItems[row.index];
          if (!item) return null;
          const { node, depth } = item;
          const lineNum = row.index + 1;
          const indent = depth * INDENT_WIDTH;

          if (item.type === "closing") {
            const bracket = node.value_type === "object" ? "}" : "]";
            return (
              <div
                key={`${node.id}-close`}
                data-index={row.index}
                ref={wordWrap ? virtualizer.measureElement : undefined}
                className="tree-line"
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%",
                  minHeight: ESTIMATED_ROW_HEIGHT,
                  transform: `translateY(${row.start}px)`,
                }}
              >
                <IndentGuides depth={depth} leftOffset={lineNumWidth} />
                <LineNum num={lineNum} width={lineNumWidth} />
                <span className={contentClass}>
                  <span style={{ paddingLeft: indent }} />
                  <span style={{ color: "var(--json-bracket)" }}>{bracket}</span>
                </span>
              </div>
            );
          }

          const isExpanded = expanded.has(node.id);

          return (
            <div
              key={node.id}
              data-index={row.index}
              ref={wordWrap ? virtualizer.measureElement : undefined}
              className="tree-line"
              style={{
                position: "absolute", top: 0, left: 0, width: "100%",
                minHeight: ESTIMATED_ROW_HEIGHT,
                transform: `translateY(${row.start}px)`,
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => node.is_expandable && toggleExpand(node.id)}
            >
              <IndentGuides depth={depth} leftOffset={lineNumWidth} />
              <LineNum num={lineNum} width={lineNumWidth} />

              {hoveredId === node.id && (
                <NodeActions node={node} copy={copy} onOpenSubtree={onOpenSubtree} />
              )}

              <span className={contentClass}>
                {node.is_expandable ? (
                  <span className={`tree-chevron${isExpanded ? " expanded" : ""}`}>
                    <IconChevronRight width={12} height={12} />
                  </span>
                ) : (
                  <span className="gutter" />
                )}

                <span style={{ paddingLeft: indent }} />

                {node.key !== null && (
                  <>
                    <span style={{ color: "var(--json-key)", cursor: "pointer" }} onDoubleClick={(e) => { e.stopPropagation(); copy(node.key!); }}>
                      "{highlightQuery ? highlightMatches(node.key, highlightQuery) : node.key}"
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>: </span>
                  </>
                )}

                {renderValue(node, isExpanded, copy, highlightQuery)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}