import type { FileTab } from "../types";
import { useTooltip } from "../context/TooltipContext";
import { IconBraces, IconCode, IconFile, IconX } from "./Icons";

interface TabBarProps {
  tabs: FileTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

const FORMAT_ICON: Record<string, React.FC<{ width?: number; height?: number }>> = {
  json: IconBraces,
  xml: IconCode,
};

export function TabBar({ tabs, activeTabId, onSelectTab, onCloseTab }: TabBarProps) {
  const { show, hide } = useTooltip();

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex items-end overflow-x-auto shrink-0"
      style={{
        height: "var(--tabbar-height)",
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const FormatIcon = FORMAT_ICON[tab.format] ?? IconFile;

        return (
          <div
            key={tab.id}
            data-active={isActive ? "true" : undefined}
            className="group flex items-center gap-1.5 cursor-pointer shrink-0 relative tab-item animate-tab-in"
            style={{
              height: "100%",
              padding: "0 14px",
              background: isActive ? "var(--surface-0)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
              borderTop: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              borderRight: "1px solid var(--border-subtle)",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              transition: "background 0.15s ease, color 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onClick={() => onSelectTab(tab.id)}
            onMouseEnter={(e) => show(tab.path, e)}
            onMouseLeave={hide}
          >
            <FormatIcon width={12} height={12} />
            <span className="truncate max-w-[160px]">{tab.name}</span>

            {tab.isLoading && (
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" className="animate-spin shrink-0">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
                <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}

            <button
              className="shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-150"
              style={{
                width: 18,
                height: 18,
                color: "var(--text-tertiary)",
              }}
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                show("Close tab", e);
                e.currentTarget.style.color = "var(--danger)";
                e.currentTarget.style.background = "var(--danger-subtle)";
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                hide();
                e.currentTarget.style.color = "var(--text-tertiary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <IconX width={10} height={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}