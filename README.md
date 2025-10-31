# 🛠️ Browser DevTools

> Overly extensive development tools for web browser data storage

A comprehensive web-based developer toolkit for inspecting, managing, and validating browser storage with advanced features including version history, diff viewing, and data validation.

---

## ✨ Features

### 🗄️ Storage Inspector

A powerful browser storage management tool supporting **localStorage**, **sessionStorage**, and **IndexedDB**.

#### Core Features
- ✅ **Multi-Storage Support**
  - LocalStorage
  - SessionStorage
  - IndexedDB (database and object store selection)
- 🔍 **Real-time Search & Filter** - Filter items by key name
- 📊 **Smart Grouping** - Automatic grouping by key prefixes (e.g., `app:settings`, `user:data`)
- 📈 **Storage Statistics** - Visual usage meter and item count
- 🔄 **Auto-refresh** - Detects changes from other tabs
- 🌓 **Dark/Light Theme** - System-aware theme with manual toggle

#### Data Management
- ➕ **Add Items** - Create new storage entries with type detection
- ✏️ **Inline Editing** - Click any key or value to edit in-place
- 🗑️ **Delete Items** - Remove individual items or clear all storage
- 📋 **Copy to Clipboard** - One-click copy of key-value pairs
- 📤 **Import/Export** - Backup and restore storage as JSON files

#### Advanced Features
- 🔤 **Data Type Detection** - Automatically identifies and displays data types:
  - String
  - Number
  - Boolean
  - Object
  - Array
- 📝 **JSON Editor** - Full-featured modal editor for complex objects
- 📜 **Version History** - Tracks up to 10 revisions per key (localStorage/sessionStorage only)
- 🔀 **Diff Viewer** - Compare current value against previous versions
- 💾 **Profile System** - Save and load complete storage snapshots
- 👁️ **Column Visibility** - Toggle which columns to display
- 🔽 **Collapsible Groups** - Expand/collapse grouped items
- ⚡ **Sortable Columns** - Sort by type, key, or value

---

### 🆚 Diff Viewer

Advanced side-by-side comparison tool for viewing changes between versions.

#### Features
- 📊 **Side-by-Side Display** - Dual-pane layout with synchronized scrolling
- 🎨 **Syntax Highlighting** - Powered by highlight.js with Monokai theme
- 🔍 **Line-by-Line Diff** - Clear visualization of:
  - Added lines (green)
  - Deleted lines (red)
  - Changed lines (yellow)
  - Character-level changes within lines
- 📜 **Version Selection** - Compare against any saved revision
- 🔎 **Search Function** - Find text across both panes
- ⚙️ **Customization Options**:
  - Font family selection (Consolas, Courier New, Fira Code, etc.)
  - Font size adjustment (10px-20px)
  - Line wrapping toggle
- 📊 **Statistics** - Shows count of added/deleted lines
- 🎯 **Virtual Scrolling** - Efficient rendering for large files

---

### ✅ JSON Validator & Formatter

Validate, format, and compress JSON data with ease.

#### Features
- ✔️ **Validation** - Instant JSON syntax checking
- 🎨 **Formatting** - Pretty-print with 2-space indentation
- 🗜️ **Compression** - Minify JSON for production
- 📋 **Copy to Clipboard** - One-click copy functionality
- 🔢 **Line Numbers** - Editor with synchronized line numbers
- 🔄 **Scroll Sync** - Line numbers stay in sync with content
- ❌ **Error Display** - Clear error messages with line information

---

### 📝 YAML Validator & Formatter

Validate, format, and minify YAML documents.

#### Features
- ✔️ **Validation** - Parse and validate YAML syntax
- 🎨 **Formatting** - Auto-format with proper indentation
- 🗜️ **Minification** - Convert to flow style for compact output
- 📋 **Copy to Clipboard** - One-click copy functionality
- 🔢 **Line Numbers** - Editor with synchronized line numbers
- 🔄 **Scroll Sync** - Line numbers stay in sync with content
- ❌ **Error Display** - Detailed error messages
- 🔄 **YAML ↔ JSON** - Easy conversion between formats

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pkeffect/Browser-DevTools.git
   cd Browser-DevTools
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

No build process or dependencies required! This is a pure client-side application.

---

## 💻 Usage

### Storage Inspector

#### Basic Operations
1. **Select Storage Type** - Choose from dropdown (localStorage, sessionStorage, or IndexedDB)
2. **For IndexedDB**: Select database and object store from the additional dropdowns
3. **Add New Item**:
   - Select data type (String, Number, Boolean)
   - Enter key and value
   - Click `+` button
4. **Edit Item** - Click on any key or value cell to edit inline
5. **Delete Item** - Click trash icon next to item
6. **Search** - Type in search box to filter by key name

#### Advanced Operations

**Version History & Diff:**
1. Click the "View" (👁️) button on any item
2. Click "Compare Versions" in the modal
3. Select a previous version from dropdown
4. View side-by-side comparison with highlighting

**Profiles:**
1. Click "Save Profile" button
2. Enter a name for your profile
3. Load profiles from dropdown
4. Manage profiles with "Manage Profiles" button

**Import/Export:**
- **Export**: Click "Export" to download current storage as JSON
- **Import**: Click "Import" and select a JSON file

### JSON/YAML Validators

1. Paste or type your JSON/YAML in the editor
2. Click "Validate & Format" to check syntax and format
3. Click "Compress/Minify" to create compact version
4. Click "Clear" to reset editor
5. Use copy button to copy content to clipboard

---

## 🎨 Theme Support

The application automatically detects your system theme preference and includes a manual theme toggle.

- 🌙 **Dark Mode** - Low-light optimized color scheme
- ☀️ **Light Mode** - High-contrast light theme
- 🔄 **Toggle Button** - Located in the navigation bar
- 💾 **Persistent** - Theme preference saved to localStorage

---

## 🏗️ Architecture

### File Structure

```
Browser-DevTools/
├── index.html                          # Main HTML file
├── app.js                              # Application entry point
├── main.css                            # Global styles
├── theme-switcher.js/css               # Theme management
├── utils.js                            # Shared utility functions
│
├── storage/                            # Storage Inspector
│   ├── storage-inspector-widget.html   # Widget HTML
│   ├── storage-inspector.css           # Widget styles
│   ├── storage-main.js                 # Main controller
│   ├── storage-api.js                  # Storage operations API
│   ├── storage-ui.js                   # UI rendering functions
│   ├── storage-profiles.js             # Profile management
│   └── storage-revisions.js            # Version history
│
├── diff-viewer/                        # Diff Viewer
│   ├── diff-viewer-widget.html         # Widget HTML
│   ├── diff-viewer.css                 # Widget styles
│   ├── diff-viewer.js                  # Main diff logic
│   ├── diff.min.js                     # jsdiff library
│   ├── highlight.min.js                # Syntax highlighting
│   └── monokai.min.css                 # Code theme
│
├── json-validator/                     # JSON Validator
│   ├── json-validator-widget.html      # Widget HTML
│   ├── json-validator.css              # Widget styles
│   └── json-validator.js               # Validation logic
│
└── yaml-validator/                     # YAML Validator
    ├── yaml-validator-widget.html      # Widget HTML
    ├── yaml-validator.css              # Widget styles
    ├── yaml-validator.js               # Validation logic
    └── js-yaml.min.js                  # js-yaml library
```

### Module System

The application uses ES6 modules for clean separation of concerns:

- **storage-api.js** - Pure storage operations (CRUD, IndexedDB helpers)
- **storage-ui.js** - UI rendering and DOM manipulation
- **storage-main.js** - Controller coordinating API and UI
- **storage-profiles.js** - Profile save/load functionality
- **storage-revisions.js** - Version history tracking

---

## 🔧 Technical Details

### Storage Limits
- **localStorage**: ~10MB (5-10MB typical)
- **sessionStorage**: ~10MB (5-10MB typical)
- **IndexedDB**: Much larger (50MB+ typically, varies by browser)

### Browser Compatibility
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IndexedDB features may vary by browser

### Dependencies

All dependencies are included via CDN or minified files:
- **jsdiff** (5.1.0) - Text diffing algorithm
- **highlight.js** (11.9.0) - Syntax highlighting
- **js-yaml** (4.1.0) - YAML parsing and dumping

---

## 🎯 Use Cases

- 🔍 **Debug Storage Issues** - Inspect and modify browser storage in real-time
- 📦 **Data Migration** - Export storage from one environment, import to another
- 🔄 **Version Tracking** - Monitor changes to critical configuration values
- 🧪 **Testing** - Quickly set up test data scenarios
- 📊 **Data Analysis** - Examine storage patterns and usage
- 🔀 **Compare Changes** - Identify exactly what changed between versions
- ✅ **Validate Data** - Ensure JSON/YAML data is properly formatted

---

## 🛡️ Privacy & Security

- ✅ **100% Client-Side** - No data is sent to any server
- ✅ **No Analytics** - No tracking or telemetry
- ✅ **No External Requests** - Works completely offline
- ✅ **Open Source** - Full code transparency
- ⚠️ **Local Only** - Storage changes affect your current browser only

---

## 🐛 Known Limitations

- IndexedDB support is read-only for complex key paths
- Revision history only available for localStorage/sessionStorage (not IndexedDB)
- Very large objects (>1MB) may cause performance issues in diff viewer
- Some IndexedDB object stores with auto-increment keys may have limited edit capability

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🐛 **Report Bugs** - Open an issue with details
2. 💡 **Suggest Features** - Share your ideas
3. 🔧 **Submit PRs** - Fork, create branch, submit PR
4. 📖 **Improve Docs** - Help make documentation clearer

### Development Setup

```bash
# Clone repository
git clone https://github.com/pkeffect/Browser-DevTools.git

# No build step needed! Just open index.html
# Or run a local server:
python -m http.server 8000
```

### Code Style
- Use ES6+ features
- Follow existing code structure
- Add comments for complex logic
- Keep functions small and focused

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

Copyright (c) 2025 pkeffect

---

## 🙏 Acknowledgments

- [jsdiff](https://github.com/kpdecker/jsdiff) - Text diffing by Kevin Decker
- [highlight.js](https://highlightjs.org/) - Syntax highlighting
- [js-yaml](https://github.com/nodeca/js-yaml) - YAML parser

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/Browser-DevTools/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/Browser-DevTools/discussions)

---

## 🗺️ Roadmap

Future features under consideration:

- [ ] Cookie inspector/editor
- [ ] Cache Storage viewer
- [ ] Service Worker inspector
- [ ] Export to different formats (CSV, XML)
- [ ] Bulk operations (regex find/replace)
- [ ] Storage quota information
- [ ] Encryption/decryption tools
- [ ] Data visualization/charts
- [ ] Comparison between storage types
- [ ] Automated testing tools

---

<div align="center">

**Made with ❤️ for developers**

⭐ Star this repo if you find it useful!

</div>
