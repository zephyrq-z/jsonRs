import { useState, useCallback, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useTheme } from "./hooks/useTheme";
import { useFileTabs } from "./hooks/useFileTabs";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useClipboardPaste } from "./hooks/useClipboardPaste";
import { TooltipProvider } from "./context/TooltipContext";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TabBar } from "./components/TabBar";
import { Toolbar } from "./components/Toolbar";
import { SidePanel } from "./components/SidePanel";
import { SearchBar } from "./components/SearchBar";
import { StatusBar } from "./components/StatusBar";
import { JsonTreeView } from "./components/JsonTreeView";
import { XmlTreeView } from "./components/XmlTreeView";
import { TextViewer } from "./components/TextViewer";
import { JsonlViewer } from "./components/JsonlViewer";
import { SplitPane } from "./components/SplitPane";
import { GoToLineDialog } from "./components/GoToLineDialog";
import { EmptyState, LoadingState } from "./components/Placeholders";
import type { RecentFile } from "./types";
import type { SearchResult, SearchOptions, JsonNode, XmlElement, FileFormat, ViewMode } from "./types";
import { PasteDialog } from "./components/PasteDialog";

function NeonFrame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start = 0;
    const speed = 0.03; // degrees per ms
    const animate = (ts: number) => {
      if (!start) start = ts;
      const angle = ((ts - start) * speed) % 360;
      if (ref.current) {
        ref.current.style.setProperty("--neon-angle", `${angle}deg`);
      }
      raf = requestAnimationFrame(animate);
    };
    let raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={ref} className="neon-frame" />;
}

function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    loadFile,
    closeTab,
    setViewMode,
    addPasteTab,
    updateTabContent,
  } = useFileTabs();

  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [wordWrap, setWordWrap] = useState(false);
  const [horizontalScroll, setHorizontalScroll] = useState(false);
  const [expandSignal, setExpandSignal] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // ── Load recent files on mount ─────────────────────────
  useEffect(() => {
    invoke<RecentFile[]>("get_recent_files")
      .then(setRecentFiles)
      .catch(() => {});
  }, []);

  // ── Refresh recent files ───────────────────────────────
  const refreshRecent = useCallback(() => {
    invoke<RecentFile[]>("get_recent_files")
      .then(setRecentFiles)
      .catch(() => {});
  }, []);

  const [showPasteDialog, setShowPasteDialog] = useState(false);

  const textViewerRef = useRef<{ scrollToLine: (line: number) => void }>(null);
  const splitTextRef = useRef<{ scrollToLine: (line: number) => void }>(null);

  // ── File opening ────────────────────────────────────────
  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          { name: "Data Files", extensions: ["json", "jsonl", "xml", "svg", "geojson", "html", "htm"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });
      if (!selected) return;
      const files = Array.isArray(selected) ? selected : [selected];
      for (const p of files) {
        await loadFile(p);
        const name = p.split("/").pop() ?? p;
        invoke("add_recent_file", { path: p, name, format: "text" });
      }
      refreshRecent();
    } catch (err) {
      console.error("Failed to open:", err);
    }
  }, [loadFile]);

  // ── Copy all content ───────────────────────────────────
  const handleCopyAll = useCallback(async () => {
    if (!activeTab?.content) return;
    try {
      await navigator.clipboard.writeText(activeTab.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = activeTab.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [activeTab]);

  // ── Paste dialog ──────────────────────────────────────
  const handlePasteClick = useCallback(() => setShowPasteDialog(true), []);
  const handlePasteConfirm = useCallback(
    async (text: string) => {
      setShowPasteDialog(false);
      const format: FileFormat =
        text.trim().startsWith("{") || text.trim().startsWith("[") ? "json"
        : text.trim().startsWith("<") ? "xml"
        : "text";

      if (format === "json") {
        try {
          const treeData = await invoke<JsonNode[]>("parse_json_full", { content: text });
          addPasteTab(text, "json", treeData);
          return;
        } catch { /* fall through */ }
      } else if (format === "xml") {
        try {
          const treeData = await invoke<XmlElement[]>("parse_xml", { content: text });
          addPasteTab(text, "xml", treeData);
          return;
        } catch { /* fall through */ }
      }
      addPasteTab(text, format);
    },
    [addPasteTab],
  );

  // ── Cycle view mode: tree → split → text → tree ────────
  const handleCycleViewMode = useCallback(() => {
    if (!activeTab || activeTab.format === "jsonl") return;
    const next: Record<ViewMode, ViewMode> = { tree: "split", split: "text", text: "tree" };
    setViewMode(activeTab.id!, next[activeTab.viewMode]);
  }, [activeTab, setViewMode]);

  // ── Expand / Collapse all ──────────────────────────────
  const handleExpandAll = useCallback(() => setExpandSignal((n) => Math.abs(n) + 1), []);
  const handleCollapseAll = useCallback(() => setExpandSignal((n) => -(Math.abs(n) + 1)), []);

  // ── Search ─────────────────────────────────────────────
  const handleSearch = useCallback(
    async (options: SearchOptions) => {
      if (!activeTab?.content) return;
      try {
        const results = await invoke<SearchResult[]>("search_text", {
          content: activeTab.content,
          query: options.query,
          caseSensitive: options.caseSensitive,
          useRegex: options.useRegex,
          wholeWord: options.wholeWord,
        });
        setSearchResults(results);
        setSearchQuery(options.query);
        setCurrentSearchIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      }
    },
    [activeTab],
  );

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery("");
  }, []);
  // ── Format JSON ────────────────────────────────────────
  const handleFormat = useCallback(
    async (mode: "pretty" | "minify") => {
      if (!activeTab?.content || activeTab.format !== "json") return;
      try {
        const formatted = await invoke<string>("format_json", {
          content: activeTab.content,
          mode,
        });
        let treeData: JsonNode[] | null = null;
        try {
          treeData = await invoke<JsonNode[]>("parse_json_full", { content: formatted });
        } catch { /* keep text */ }
        updateTabContent(activeTab.id!, formatted, treeData);
      } catch (err) {
        console.error("Format failed:", err);
      }
    },
    [activeTab, updateTabContent],
  );

  // ── Open subtree as new tab ────────────────────────────
  const handleOpenSubtree = useCallback(
    (jsonText: string) => {
      addPasteTab(jsonText, "json");
    },
    [addPasteTab],
  );

  // ── Open JSONL line as new tab ─────────────────────────
  const handleOpenJsonlLine = useCallback(
    async (jsonText: string, lineNumber: number) => {
      const name = activeTab ? `${activeTab.name}:${lineNumber}` : `Line ${lineNumber}`;
      let treeData: JsonNode[] | null = null;
      try {
        treeData = await invoke<JsonNode[]>("parse_json_full", { content: jsonText });
      } catch { /* fallback to text */ }
      addPasteTab(jsonText, "json", treeData, name);
    },
    [addPasteTab, activeTab],
  );

  // ── Go to line ─────────────────────────────────────────
  const handleGoToLine = useCallback(() => {
    if (activeTab) setShowGoToLine(true);
  }, [activeTab]);

  const handleGoToLineConfirm = useCallback((line: number) => {
    textViewerRef.current?.scrollToLine(line);
    splitTextRef.current?.scrollToLine(line);
  }, []);

  const handleSearchResultClick = useCallback((line: number) => {
    textViewerRef.current?.scrollToLine(line);
    splitTextRef.current?.scrollToLine(line);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────
  useClipboardPaste({ addPasteTab });
  useKeyboardShortcuts({
    onOpenFile: handleOpenFile,
    onToggleSearch: () => setShowSearch(true),
    onToggleTheme: toggleTheme,
    onCloseCurrentTab: () => activeTabId && closeTab(activeTabId),
    onGoToLine: handleGoToLine,
    onCloseSearch: handleCloseSearch,
    activeTabId,
  });

  // ── Drag & drop ────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File & { path?: string };
        if (file.path) loadFile(file.path);
      }
    },
    [loadFile],
  );

  // ── Render helpers ─────────────────────────────────────
  const maxLine = activeTab?.content ? activeTab.content.split("\n").length : 0;
  const hasTree = activeTab && activeTab.treeData;
  const isTree = activeTab?.viewMode === "tree";
  const isSplit = activeTab?.viewMode === "split";
  const isJsonl = activeTab?.format === "jsonl";

  const viewLabel = isTree ? "Tree" : isSplit ? "Split" : isJsonl ? "JSONL" : "Text";

  const renderTreeView = () => {
    if (!activeTab || !hasTree) return null;
    if (activeTab.format === "json") {
      return (
        <JsonTreeView
          nodes={(activeTab.treeData as JsonNode[]) ?? []}
          expandSignal={expandSignal}
          wordWrap={wordWrap}
          highlightQuery={searchQuery}
          onOpenSubtree={handleOpenSubtree}
        />
      );
    }
    return (
      <XmlTreeView
        elements={(activeTab.treeData as XmlElement[]) ?? []}
        expandSignal={expandSignal}
        wordWrap={wordWrap}
        highlightQuery={searchQuery}
        onOpenSubtree={handleOpenSubtree}
      />
    );
  };

  const renderJsonlView = () => (
    <JsonlViewer
      content={activeTab?.content ?? ""}
      onOpenLine={handleOpenJsonlLine}
    />
  );

  const renderTextView = (ref: React.RefObject<{ scrollToLine: (line: number) => void } | null>) => (
    <TextViewer
      ref={ref}
      content={activeTab?.content ?? ""}
      showLineNumbers
      searchResults={searchResults}
      activeSearchIndex={currentSearchIndex}
      wordWrap={wordWrap}
      horizontalScroll={horizontalScroll}
    />
  );

  return (
    <ToastProvider>
    <TooltipProvider>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: "var(--surface-0)", color: "var(--text-primary)" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <NeonFrame />
        {/* Titlebar */}
        <div
          className="drag-region flex items-center shrink-0"
          style={{ height: "var(--titlebar-height)", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}
        >
          <div style={{ width: "var(--traffic-light-width)", flexShrink: 0 }} />
          <div className="flex-1 flex items-center justify-center min-w-0">
            <span
              className="text-[11px] font-semibold truncate select-none"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.02em" }}
            >
              {activeTab ? activeTab.name : "jsonRs"}
            </span>
          </div>
          <div style={{ width: "var(--traffic-light-width)", flexShrink: 0 }} />
        </div>

        {/* Toolbar */}
        <Toolbar
          onOpenFile={handleOpenFile}
          onToggleSearch={() => setShowSearch((p) => !p)}
          onToggleSidebar={() => setShowSidebar((p) => !p)}
          onToggleTheme={toggleTheme}
          onCycleViewMode={handleCycleViewMode}
          onCopyAll={handleCopyAll}
          onPaste={handlePasteClick}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onToggleWordWrap={() => setWordWrap((p) => !p)}
          onToggleHScroll={() => setHorizontalScroll((p) => !p)}
          onFormat={handleFormat}
          activeTab={activeTab}
          showSidebar={showSidebar}
          isDark={isDark}
          wordWrap={wordWrap}
          horizontalScroll={horizontalScroll}
          copied={copied}
          viewLabel={viewLabel}
        />

        {/* Tabs */}
        {tabs.length > 0 && (
          <TabBar tabs={tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} onCloseTab={closeTab} />
        )}

        {/* Search */}
        {showSearch && (
          <SearchBar
            onSearch={handleSearch}
            onClose={handleCloseSearch}
            resultCount={searchResults.length}
            currentIndex={currentSearchIndex}
            onNavigate={(dir) => {
              setCurrentSearchIndex((prev) => {
                if (searchResults.length === 0) return 0;
                return dir === "next"
                  ? (prev + 1) % searchResults.length
                  : (prev - 1 + searchResults.length) % searchResults.length;
              });
            }}
          />
        )}

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {showSidebar && activeTab && (
            <SidePanel
              tab={activeTab}
              searchResults={searchResults}
              onSearchResultClick={handleSearchResultClick}
            />
          )}

          <main className="flex-1 overflow-hidden relative flex flex-col">
            {tabs.length === 0 ? (
              <EmptyState recentFiles={recentFiles} onOpenRecent={loadFile} />
            ) : activeTab?.isLoading ? (
              <LoadingState />
            ) : isJsonl ? (
              <ErrorBoundary>
                <div className="flex-1 overflow-hidden">
                  {renderJsonlView()}
                </div>
              </ErrorBoundary>
            ) : isSplit && hasTree ? (
              <ErrorBoundary>
                <SplitPane
                  left={renderTreeView()}
                  right={renderTextView(splitTextRef)}
                />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary>
                <div className="flex-1 overflow-hidden">
                  {isTree && hasTree
                    ? renderTreeView()
                    : renderTextView(textViewerRef)}
                </div>
              </ErrorBoundary>
            )}
          </main>
        </div>

        {/* Status bar */}
        <StatusBar activeTab={activeTab} searchResultCount={searchResults.length} isDark={isDark} />

        {/* Go to line dialog */}
        {showGoToLine && activeTab && (
          <GoToLineDialog
            maxLine={maxLine}
            onGoTo={handleGoToLineConfirm}
            onClose={() => setShowGoToLine(false)}
          />
        )}

        {/* Paste dialog */}
        {showPasteDialog && (
          <PasteDialog
            onConfirm={handlePasteConfirm}
            onClose={() => setShowPasteDialog(false)}
          />
        )}
      </div>
    </TooltipProvider>
    </ToastProvider>
  );
}

export default App;