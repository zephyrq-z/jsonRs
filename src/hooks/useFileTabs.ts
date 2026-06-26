import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { FileTab, FileFormat, ViewMode, JsonNode, XmlElement } from "@/types";

export function useFileTabs() {
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  const loadFile = useCallback(async (path: string) => {
    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const name = path.split("/").pop() ?? path.split("\\").pop() ?? "untitled";

    setTabs((prev) => {
      const existing = prev.find((t) => t.path === path);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab: FileTab = {
        id: tabId,
        name,
        path,
        format: "text",
        viewMode: "text",
        isLoading: true,
        fileSize: 0,
        lastModified: 0,
      };
      setActiveTabId(tabId);
      return [...prev, newTab];
    });

    try {
      const result = await invoke<{
        content: string;
        format: string;
        size: number;
        line_count: number;
        truncated: boolean;
      }>("read_file_content", { path });

      const format = result.format as FileFormat;
      let treeData: JsonNode[] | XmlElement[] | null = null;

      if (format === "json") {
        try {
          const useShallow = result.size > 5 * 1024 * 1024;
          treeData = useShallow
            ? await invoke<JsonNode[]>("parse_json_shallow", { content: result.content })
            : await invoke<JsonNode[]>("parse_json_full", { content: result.content });
        } catch { /* fallback */ }
      } else if (format === "xml") {
        try {
          treeData = await invoke<XmlElement[]>("parse_xml", { content: result.content });
        } catch { /* fallback */ }
      }

      const viewMode: ViewMode = treeData ? "tree" : "text";

      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? { ...t, format, content: result.content, treeData, isLoading: false, fileSize: result.size, viewMode }
            : t,
        ),
      );
    } catch (err) {
      console.error("Failed to load file:", err);
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, isLoading: false } : t)),
      );
    }
  }, []);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tabId);
        const next = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId) {
          const newActive = next[Math.min(idx, next.length - 1)];
          setActiveTabId(newActive?.id ?? null);
        }
        return next;
      });
    },
    [activeTabId],
  );

  const toggleViewMode = useCallback(() => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, viewMode: (t.viewMode === "tree" ? "text" : "tree") as ViewMode }
          : t,
      ),
    );
  }, [activeTabId]);

  const setViewMode = useCallback(
    (tabId: string, mode: ViewMode) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, viewMode: mode } : t)),
      );
    },
    [],
  );

  const addPasteTab = useCallback(
    async (text: string, format: FileFormat, treeData?: JsonNode[] | XmlElement[] | null, name?: string) => {
      const tabId = `paste-${Date.now()}`;
      const viewMode: ViewMode = treeData ? "tree" : "text";
      const newTab: FileTab = {
        id: tabId,
        name: name ?? "Pasted Content",
        path: "clipboard",
        format,
        viewMode,
        content: text,
        treeData: treeData ?? null,
        isLoading: false,
        fileSize: text.length,
        lastModified: Date.now(),
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(tabId);
    },
    [],
  );

  const updateTabContent = useCallback(
    (tabId: string, content: string, treeData?: JsonNode[] | XmlElement[] | null) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? { ...t, content, treeData: treeData ?? t.treeData, fileSize: content.length }
            : t,
        ),
      );
    },
    [],
  );

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    loadFile,
    closeTab,
    toggleViewMode,
    setViewMode,
    addPasteTab,
    updateTabContent,
  };
}