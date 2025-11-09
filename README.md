# 🛠️ Storage Inspector

> Overly extensive development tools for web browser data storage

A comprehensive web-based developer toolkit for inspecting, managing, and validating browser storage with advanced features including version history, profiles and diff viewing.

---

## ✨ Features

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

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pkeffect/storage-inspector.git
   cd storage-inspector
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

No build process or dependencies required! This is a pure client-side application. Drop into any http server.

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
storage-inspector/
├── css/
│   ├── main.css
│   ├── storage-inspector.css
│   └── theme-switcher.css
├── js/
│   ├── app.js
│   ├── storage-inspector-api.js
│   ├── storage-inspector-bookmarklet.js
│   ├── storage-inspector-main.js
│   ├── storage-inspector-profiles.js
│   ├── storage-inspector-revisions.js
│   ├── storage-inspector-ui.js
│   ├── theme-switcher.js
│   └── utils.js
├── index.html
└── storage-inspector-widget.html
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
- Check `js/storage-inspector-bookmarklet.js` for using this on any domain as a Bookmarklet

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
git clone https://github.com/pkeffect/storage-inspector.git

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

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/pkeffect/storage-inspector/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/pkeffect/storage-inspector/discussions)

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
