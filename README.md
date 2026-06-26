<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a>
</p>

<p align="center">
  <h1 align="center">jsonRs</h1>
  <p align="center">
    A lightweight, blazing-fast JSON / XML desktop viewer built with Tauri 2 + React 19.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white" alt="Tauri 2" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Rust-1.70+-DEA584?logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  </p>
</p>

## ✨ Features

- **🌲 Tree View** — Collapsible, syntax-highlighted JSON / XML tree with search highlighting
- **📝 Text View** — Virtual-scrolled plain text with line numbers
- **🔀 Split View** — Side-by-side tree + text view
- **🔍 Full-Text Search** — Regex, case-sensitive, whole-word with inline highlighting in tree, text, and split views
- **📂 Multi-Tab** — Open multiple files, drag-and-drop, clipboard paste
- **⚡ Large File Support** — 50 MB+ files with shallow parsing and on-demand expansion
- **🎨 Dark / Light Theme** — System preference with manual toggle
- **⌨️ Keyboard Shortcuts** — ⌘O open, ⌘F search, ⌘G go to line, ⌘W close tab, ⌘⇧T toggle theme
- **🔒 Privacy-First** — Fully offline, no telemetry, no network calls

## 📸 Screenshots

> _Screenshots coming soon — run `pnpm tauri dev` to see it in action!_

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| pnpm | latest | `npm install -g pnpm` |
| Rust | ≥ 1.70 | [rustup.rs](https://rustup.rs) |
| Xcode CLT *(macOS)* | latest | `xcode-select --install` |

### Development

```bash
# Clone
git clone https://github.com/zephyrq-z/jsonRs.git
cd jsonRs

# Install dependencies
pnpm install

# Start dev server (opens the app automatically)
pnpm tauri dev
```

### Build

```bash
# Build for current platform
pnpm tauri build

# macOS: build DMG only
pnpm tauri build --bundles dmg
```

The compiled application will be in `src-tauri/target/release/bundle/`.

## 🏗️ Architecture

```
jsonRs/
├── src/                        # React frontend
│   ├── App.tsx                 # Root component (state, shortcuts, DnD, search)
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind v4 theme + custom styles
│   ├── types/index.ts          # Shared TypeScript types
│   ├── hooks/
│   │   ├── useFileTabs.ts      # Multi-tab state management
│   │   ├── useTheme.ts         # Dark/light/system theme
│   │   ├── useKeyboardShortcuts.ts  # Global keyboard bindings
│   │   └── useClipboardPaste.ts     # Automatic clipboard paste
│   ├── context/
│   │   └── TooltipContext.tsx   # Floating tooltip system
│   └── components/
│       ├── JsonTreeView.tsx     # JSON tree (collapsible, highlighted, search)
│       ├── XmlTreeView.tsx      # XML tree (elements/attrs/CDATA/comments, search)
│       ├── TextViewer.tsx       # Virtual-scrolled text (line numbers, search)
│       ├── SplitPane.tsx        # Draggable tree+text split view
│       ├── Toolbar.tsx          # Top toolbar (open, paste, format, expand, theme)
│       ├── TabBar.tsx           # Tab navigation
│       ├── SidePanel.tsx        # Sidebar (file info, search results, shortcuts)
│       ├── SearchBar.tsx        # Search input (regex, case, word, nav)
│       ├── StatusBar.tsx        # Bottom status bar
│       ├── PasteDialog.tsx      # Paste content modal
│       ├── GoToLineDialog.tsx   # Go to line modal
│       ├── ErrorBoundary.tsx    # React error boundary
│       └── Placeholders.tsx     # Empty state + loading spinner
│
├── src-tauri/                  # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/default.json
│   └── src/
│       ├── main.rs             # Binary entry
│       ├── lib.rs              # Module registration + Tauri builder
│       ├── commands.rs         # 10 IPC commands exposed to frontend
│       ├── json_parser.rs      # JSON parsing (shallow + full recursive)
│       ├── xml_parser.rs       # XML parsing via quick-xml
│       ├── file_reader.rs      # File I/O + format auto-detection
│       ├── searcher.rs         # Regex-powered search engine
│       └── history.rs          # Recent files history (persisted)
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```
### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Tauri 2 over Electron** | ~5 MB binary vs ~150 MB; native performance |
| **Shallow parse for large files** | Files > 5 MB: only top-level keys loaded initially, children expanded on demand |
| **Rust-side parsing** | `serde_json` + `quick-xml` are orders of magnitude faster than JS parsers |
| **Virtual scrolling** | `@tanstack/react-virtual` renders only visible rows — handles 1M+ line files |
| **System theme detection** | `prefers-color-scheme` media query with manual override |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘O` / `Ctrl+O` | Open file dialog |
| `⌘F` / `Ctrl+F` | Toggle search bar |
| `⌘G` / `Ctrl+G` | Go to line |
| `⌘W` / `Ctrl+W` | Close current tab |
| `⌘⇧T` / `Ctrl+Shift+T` | Toggle dark/light theme |
| `Enter` (in search) | Next match |
| `Shift+Enter` (in search) | Previous match |
| `Esc` | Close search / dialog |


## 🛠️ Tech Stack

**Frontend**
- [React 19](https://react.dev) — UI framework
- [TypeScript 5](https://typescriptlang.org) — Type safety
- [Vite 7](https://vite.dev) — Build tool
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS
- [@tanstack/react-virtual](https://tanstack.com/virtual) — Virtual scrolling

**Backend**
- [Tauri 2](https://tauri.app) — Desktop framework
- [Rust](https://rust-lang.org) — Native performance
- [serde_json](https://docs.rs/serde_json) — JSON parsing
- [quick-xml](https://docs.rs/quick-xml) — XML parsing
- [regex](https://docs.rs/regex) — Search engine

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).
