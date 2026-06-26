export type FileFormat = "json" | "xml" | "text" | "jsonl";

export type ViewMode = "tree" | "text" | "split";

export type Theme = "light" | "dark" | "system";

export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null";

export type XmlNodeType = "element" | "cdata" | "comment" | "declaration";

export interface FileTab {
  id: string;
  name: string;
  path: string;
  format: FileFormat;
  viewMode: ViewMode;
  content?: string;
  treeData?: JsonNode[] | XmlElement[] | null;
  isLoading: boolean;
  fileSize: number;
  lastModified: number;
}

export interface JsonNode {
  id: string;
  key: string | null;
  value: string;
  value_type: JsonValueType;
  depth: number;
  child_count: number;
  is_expandable: boolean;
  children?: JsonNode[];
}

export interface XmlElement {
  id: string;
  node_type: XmlNodeType;
  tag: string;
  attributes: Record<string, string>;
  children: XmlElement[];
  text?: string;
  depth: number;
  is_expandable: boolean;
}

export interface JsonlLine {
  line_number: number;
  content: string;
  parsed: JsonNode[] | null;
  error: string | null;
}

export interface SearchResult {
  line: number;
  column: number;
  context: string;
  match_start: number;
  match_end: number;
}

export interface RecentFile {
  path: string;
  name: string;
  format: string;
  timestamp: number;
}

export interface SearchOptions {
  query: string;
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

export interface AppSettings {
  theme: Theme;
  fontSize: number;
  tabSize: number;
  showLineNumbers: boolean;
  wordWrap: boolean;
  autoFormat: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  fontSize: 13,
  tabSize: 2,
  showLineNumbers: true,
  wordWrap: false,
  autoFormat: true,
};