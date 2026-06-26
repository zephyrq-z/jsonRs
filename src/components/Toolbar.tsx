import type { FileTab } from "../types";
import { useTooltip } from "../context/TooltipContext";
import {
  IconFolderOpen,
  IconSearch,
  IconSidebar,
  IconMoon,
  IconSun,
  IconTree,
  IconText,
  IconWrap,
  IconScrollH,
  IconExpandAll,
  IconCollapseAll,
  IconCopy,
  IconCheck,
  IconFormat,
  IconSplit,
  IconPaste,
} from "./Icons";

export interface ToolbarProps {
  onOpenFile: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onCycleViewMode: () => void;
  onCopyAll: () => void;
  onPaste: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleWordWrap: () => void;
  onToggleHScroll: () => void;
  onFormat: (mode: "pretty" | "minify") => void;
  activeTab: FileTab | null;
  showSidebar: boolean;
  isDark: boolean;
  wordWrap: boolean;
  horizontalScroll: boolean;
  copied: boolean;
  viewLabel: string;
}

function ToolBtn({
  onClick,
  active,
  tooltip,
  icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  tooltip: string;
  icon: React.ReactNode;
  label: string;
}) {
  const { show, hide } = useTooltip();

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => show(tooltip, e)}
      onMouseLeave={hide}
      className="toolbar-btn"
      data-active={active ? "true" : undefined}
    >
      {icon}
      <span className="toolbar-btn-label">{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div
      className="mx-1"
      style={{
        width: 1,
        height: 18,
        background: "var(--border-default)",
        borderRadius: 1,
        flexShrink: 0,
      }}
    />
  );
}

export function Toolbar({
  onOpenFile,
  onToggleSearch,
  onToggleSidebar,
  onToggleTheme,
  onCycleViewMode,
  onCopyAll,
  onPaste,
  onExpandAll,
  onCollapseAll,
  onToggleWordWrap,
  onToggleHScroll,
  onFormat,
  activeTab,
  showSidebar,
  isDark,
  wordWrap,
  horizontalScroll,
  copied,
  viewLabel,
}: ToolbarProps) {
  const hasTree = activeTab && activeTab.treeData;
  const isJson = activeTab?.format === "json";

  return (
    <div
      className="flex items-center shrink-0 px-3 gap-1"
      style={{
        height: "var(--toolbar-height)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
      }}
    >
      <ToolBtn onClick={onOpenFile} tooltip="Open file (⌘O)" icon={<IconFolderOpen width={16} height={16} />} label="Open" />
      <ToolBtn onClick={onPaste} tooltip="Paste from clipboard" icon={<IconPaste width={16} height={16} />} label="Paste" />
      <Divider />
      <ToolBtn onClick={onToggleSearch} tooltip="Search (⌘F)" icon={<IconSearch width={16} height={16} />} label="Search" />
      <ToolBtn
        onClick={onCopyAll}
        active={copied}
        tooltip={copied ? "Copied!" : "Copy all content"}
        icon={copied ? <IconCheck width={14} height={14} /> : <IconCopy width={16} height={16} />}
        label={copied ? "Copied" : "Copy"}
      />

      {activeTab && (
        <>
          <div className="flex-1" />
          {hasTree && (
            <>
              <ToolBtn
                onClick={onCycleViewMode}
                tooltip={`View: ${viewLabel} (click to cycle)`}
                icon={viewLabel === "Tree" ? <IconTree width={16} height={16} />
                  : viewLabel === "Split" ? <IconSplit width={16} height={16} />
                  : <IconText width={16} height={16} />}
                label={viewLabel}
              />
              <Divider />
              <ToolBtn onClick={onToggleWordWrap} active={wordWrap} tooltip="Wrap long lines" icon={<IconWrap width={16} height={16} />} label="Wrap" />
              <ToolBtn onClick={onToggleHScroll} active={horizontalScroll} tooltip="Horizontal scroll" icon={<IconScrollH width={16} height={16} />} label="H-Scroll" />
              <Divider />
              <ToolBtn onClick={onExpandAll} tooltip="Expand all nodes" icon={<IconExpandAll width={16} height={16} />} label="Expand" />
              <ToolBtn onClick={onCollapseAll} tooltip="Collapse all nodes" icon={<IconCollapseAll width={16} height={16} />} label="Collapse" />
              {isJson && (
                <>
                  <Divider />
                  <ToolBtn onClick={() => onFormat("pretty")} tooltip="Format JSON (pretty-print)" icon={<IconFormat width={16} height={16} />} label="Format" />
                  <ToolBtn onClick={() => onFormat("minify")} tooltip="Minify JSON" icon={<IconMinify width={16} height={16} />} label="Minify" />
                </>
              )}
            </>
          )}
          {!hasTree && (
            <>
              <ToolBtn onClick={onToggleWordWrap} active={wordWrap} tooltip="Wrap long lines" icon={<IconWrap width={16} height={16} />} label="Wrap" />
              <ToolBtn onClick={onToggleHScroll} active={horizontalScroll} tooltip="Horizontal scroll" icon={<IconScrollH width={16} height={16} />} label="H-Scroll" />
            </>
          )}
        </>
      )}

      <div className="flex-1" />

      <ToolBtn onClick={onToggleSidebar} active={showSidebar} tooltip="Toggle sidebar" icon={<IconSidebar width={16} height={16} />} label="Sidebar" />
      <Divider />
      <ToolBtn
        onClick={onToggleTheme}
        tooltip={isDark ? "Switch to light theme" : "Switch to dark theme (⌘⇧T)"}
        icon={isDark ? <IconSun width={16} height={16} /> : <IconMoon width={16} height={16} />}
        label={isDark ? "Light" : "Dark"}
      />
    </div>
  );
}

function IconMinify({ width = 16, height = 16 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4L1 8l4 4" />
      <path d="M11 4l4 4-4 4" />
    </svg>
  );
}