import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { FileFormat, JsonNode, XmlElement } from "@/types";

interface PasteHandlers {
  addPasteTab: (text: string, format: FileFormat, treeData?: JsonNode[] | XmlElement[] | null) => void;
}

export function useClipboardPaste({ addPasteTab }: PasteHandlers) {
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (!text || text.length < 2) return;

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
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addPasteTab]);
}