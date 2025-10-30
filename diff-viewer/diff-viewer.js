// diff-viewer/diff-viewer.js
import { getRevisions } from '../storage/storage-revisions.js';
import { showTooltip } from '../utils.js';

export function init() {
    const ROW_HEIGHT = 21;
    const VISIBLE_ROW_BUFFER = 10;

    const dom = {
        container: document.getElementById('diff-viewer-container'),
        card: document.querySelector('#diff-viewer-container .diff-card'),
        title: document.getElementById('diff-viewer-title'),
        keyLabel: document.getElementById('diff-key-label'),
        revisionsDropdown: document.getElementById('revisions-dropdown'),
        closeBtn: document.getElementById('close-diff-viewer-btn'),
        codeBodyA: document.getElementById('code-body-a'),
        codeBodyB: document.getElementById('code-body-b'),
        statsLabel: document.getElementById('diff-stats-label'),
        tooltip: document.getElementById('diff-tooltip'),
        paneA: document.getElementById('diff-pane-a'),
        paneB: document.getElementById('diff-pane-b'),
        sizerA: document.getElementById('sizer-a'),
        sizerB: document.getElementById('sizer-b'),
        wrapLinesCheck: document.getElementById('wrap-lines-check'),
        fontSelect: document.getElementById('font-select'),
        fontSizeSelect: document.getElementById('font-size-select'),
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
    };

    const state = {
        currentStorage: null,
        currentKey: null,
        revisions: [],
        paneBContent: '',
        virtualRows: [],
        searchResults: [],
        currentSearchIdx: -1,
        lastQuery: '',
        isRendering: false,
    };

    const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    function show(storage, storageKey, currentJsonText) {
        state.currentStorage = storage;
        state.currentKey = storageKey;
        state.paneBContent = currentJsonText;
        dom.keyLabel.textContent = `Comparing Key: ${storageKey}`;
        const originalSavedValue = storage.getItem(storageKey) || '';
        state.revisions = [
            { timestamp: 'current-saved', value: originalSavedValue },
            ...getRevisions(storage, storageKey).reverse()
        ];
        populateRevisionsDropdown();
        const compareContent = state.revisions[0].value;
        processAndRenderDiff(compareContent, state.paneBContent);
        dom.container.style.display = 'flex';
    }

    function hide() {
        dom.container.style.display = 'none';
    }

    function populateRevisionsDropdown() {
        dom.revisionsDropdown.innerHTML = '';
        state.revisions.forEach((rev, index) => {
            const option = document.createElement('option');
            option.value = index;
            if (rev.timestamp === 'current-saved') {
                option.textContent = 'Current Saved Version';
            } else {
                option.textContent = `Revision from ${new Date(rev.timestamp).toLocaleString()}`;
            }
            dom.revisionsDropdown.appendChild(option);
        });
    }

    function handleRevisionChange() {
        const selectedIndex = dom.revisionsDropdown.value;
        const selectedRevision = state.revisions[selectedIndex];
        if (selectedRevision) {
            processAndRenderDiff(selectedRevision.value, state.paneBContent);
        }
    }

    function processAndRenderDiff(contentA, contentB) {
        generateVirtualRows(contentA, contentB);
        const totalHeight = state.virtualRows.length * ROW_HEIGHT;
        dom.sizerA.style.height = `${totalHeight}px`;
        dom.sizerB.style.height = `${totalHeight}px`;
        dom.paneA.scrollTop = 0;
        dom.paneB.scrollTop = 0;
        renderVisibleWindow();
        syncScrollInit();
    }

    function generateVirtualRows(contentA, contentB) {
        clearSearch();
        state.virtualRows = [];
        let lineNumA = 0, lineNumB = 0, added = 0, deleted = 0;
        
        const diffResult = Diff.diffLines(contentA, contentB);

        for (let i = 0; i < diffResult.length; i++) {
            const part = diffResult[i];
            const nextPart = diffResult[i + 1];

            if (part.removed && nextPart && nextPart.added) {
                const removedLines = part.value.split('\n').filter(Boolean);
                const addedLines = nextPart.value.split('\n').filter(Boolean);
                const maxLen = Math.max(removedLines.length, addedLines.length);

                for (let j = 0; j < maxLen; j++) {
                    const lineA = removedLines[j], lineB = addedLines[j];
                    if (lineA !== undefined && lineB !== undefined) {
                        state.virtualRows.push({ type: 'changed', contentA: lineA, contentB: lineB, numA: ++lineNumA, numB: ++lineNumB });
                    } else if (lineA !== undefined) {
                        deleted++;
                        state.virtualRows.push({ type: 'del', contentA: lineA, contentB: null, numA: ++lineNumA, numB: null });
                    } else if (lineB !== undefined) {
                        added++;
                        state.virtualRows.push({ type: 'add', contentA: null, contentB: lineB, numA: null, numB: ++lineNumB });
                    }
                }
                i++;
            } else {
                const lines = part.value.split('\n').filter(Boolean);
                if (part.added) {
                    added += lines.length;
                    lines.forEach(line => state.virtualRows.push({ type: 'add', contentA: null, contentB: line, numA: null, numB: ++lineNumB }));
                } else if (part.removed) {
                    deleted += lines.length;
                    lines.forEach(line => state.virtualRows.push({ type: 'del', contentA: line, contentB: null, numA: ++lineNumA, numB: null }));
                } else {
                    lines.forEach(line => state.virtualRows.push({ type: 'common', contentA: line, contentB: line, numA: ++lineNumA, numB: ++lineNumB }));
                }
            }
        }
        dom.statsLabel.textContent = `Stats: +${added} lines, -${deleted} lines.`;
    }

    function renderVisibleWindow() {
        if (state.isRendering) return;
        state.isRendering = true;

        requestAnimationFrame(() => {
            const scrollTop = dom.paneA.scrollTop;
            const paneHeight = dom.paneA.clientHeight;
            const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - VISIBLE_ROW_BUFFER);
            const endIndex = Math.min(state.virtualRows.length, Math.ceil((scrollTop + paneHeight) / ROW_HEIGHT) + VISIBLE_ROW_BUFFER);
            const visibleRows = state.virtualRows.slice(startIndex, endIndex);

            const fragmentA = document.createDocumentFragment();
            const fragmentB = document.createDocumentFragment();

            visibleRows.forEach(rowData => {
                const { type, contentA, contentB, numA, numB } = rowData;
                const trA = document.createElement('tr');
                const trB = document.createElement('tr');
                let lineHtmlA = '', lineHtmlB = '';
                let lineNumClassA = '', lineNumClassB = '';
                trA.className = trB.className = `line-${type}`;
                
                if (type === 'changed') {
                    lineNumClassA = lineNumClassB = 'line-no-changed';
                    const charDiff = Diff.diffChars(contentA, contentB);
                    let htmlA = '', htmlB = '';
                    charDiff.forEach(p => {
                        const val = escapeHtml(p.value);
                        if (p.added) htmlB += `<span class="char-add">${val}</span>`;
                        else if (p.removed) htmlA += `<span class="char-del">${val}</span>`;
                        else { htmlA += val; htmlB += val; }
                    });
                    lineHtmlA = `<code>${htmlA}</code>`;
                    lineHtmlB = `<code>${htmlB}</code>`;
                } else {
                    lineHtmlA = contentA !== null ? `<code>${escapeHtml(contentA)}</code>` : '<code>&nbsp;</code>';
                    lineHtmlB = contentB !== null ? `<code>${escapeHtml(contentB)}</code>` : '<code>&nbsp;</code>';
                }
                
                trA.innerHTML = `<td class="line-number ${lineNumClassA}">${numA || ''}</td><td class="code-line">${lineHtmlA}</td>`;
                trB.innerHTML = `<td class="line-number ${lineNumClassB}">${numB || ''}</td><td class="code-line">${lineHtmlB}</td>`;
                fragmentA.appendChild(trA);
                fragmentB.appendChild(trB);
            });
            
            dom.codeBodyA.style.paddingTop = `${startIndex * ROW_HEIGHT}px`;
            dom.codeBodyB.style.paddingTop = `${startIndex * ROW_HEIGHT}px`;
            dom.codeBodyA.innerHTML = '';
            dom.codeBodyB.innerHTML = '';
            dom.codeBodyA.appendChild(fragmentA);
            dom.codeBodyB.appendChild(fragmentB);
            
            hljs.highlightAll({ target: dom.card });
            state.isRendering = false;
        });
    }
    
    function populateAppearanceControls() {
        const fonts = ['Consolas', 'Courier New', 'Fira Code', 'Menlo', 'Source Code Pro'];
        fonts.forEach(f => dom.fontSelect.innerHTML += `<option value="${f}">${f}</option>`);
        for (let i = 10; i <= 20; i++) dom.fontSizeSelect.innerHTML += `<option value="${i}px">${i}px</option>`;
        dom.fontSizeSelect.value = '14px';
    }

    function applyStyles() {
        dom.card.style.setProperty('--editor-font-family', `'${dom.fontSelect.value}', monospace`);
        dom.card.style.setProperty('--editor-font-size', dom.fontSizeSelect.value);
    }

    function performSearch() {
        const query = dom.searchInput.value;
        if (!query) { clearSearch(); return; }
        state.lastQuery = query;
        state.searchResults = [];
        const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'gi');
        
        state.virtualRows.forEach((row, index) => {
            if (row.contentA && row.contentA.match(regex)) state.searchResults.push({ index, pane: 'A' });
            if (row.contentB && row.contentB.match(regex)) state.searchResults.push({ index, pane: 'B' });
        });
        
        if (state.searchResults.length > 0) {
            state.currentSearchIdx = 0;
            navigateSearchResults(0);
            showTooltip(dom.tooltip, dom.card, `Found ${state.searchResults.length} results.`, dom.searchInput);
        } else {
            showTooltip(dom.tooltip, dom.card, 'No results found.', dom.searchInput, { isWarning: true });
        }
    }

    function clearSearch() {
        state.searchResults = [];
        state.currentSearchIdx = -1;
        state.lastQuery = '';
        renderVisibleWindow();
    }

    function navigateSearchResults(direction) {
        if (state.searchResults.length === 0) return;
        if (direction !== 0) state.currentSearchIdx = (state.currentSearchIdx + direction + state.searchResults.length) % state.searchResults.length;
        const targetIndex = state.searchResults[state.currentSearchIdx].index;
        scrollToLine(targetIndex);
    }

    function scrollToLine(lineIndex) {
        const scrollTop = lineIndex * ROW_HEIGHT - (dom.paneA.clientHeight / 2) + ROW_HEIGHT;
        dom.paneA.scrollTop = scrollTop;
        dom.paneB.scrollTop = scrollTop;
        renderVisibleWindow();
    }

    let syncScrollInitialized = false;
    function syncScrollInit() {
        if (syncScrollInitialized) return;
        let isSyncing = false;
        const sync = (source, target) => {
            source.addEventListener('scroll', () => {
                if (!isSyncing) {
                    isSyncing = true;
                    target.scrollTop = source.scrollTop;
                    renderVisibleWindow();
                    requestAnimationFrame(() => { isSyncing = false; });
                }
            });
        };
        sync(dom.paneA, dom.paneB);
        sync(dom.paneB, dom.paneA);
        syncScrollInitialized = true;
    }

    function initialize() {
        populateAppearanceControls();
        applyStyles();
        
        dom.closeBtn.addEventListener('click', hide);
        dom.revisionsDropdown.addEventListener('change', handleRevisionChange);
        dom.wrapLinesCheck.addEventListener('change', () => dom.card.classList.toggle('wrap-text'));
        dom.fontSelect.addEventListener('change', applyStyles);
        dom.fontSizeSelect.addEventListener('change', applyStyles);

        dom.searchBtn.addEventListener('click', () => state.searchResults.length > 0 ? navigateSearchResults(1) : performSearch());
        dom.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') (state.searchResults.length > 0 && dom.searchInput.value === state.lastQuery) ? navigateSearchResults(1) : performSearch();
            if (e.key === 'Escape') { dom.searchInput.value = ''; clearSearch(); }
        });
        dom.searchInput.addEventListener('input', () => { if (dom.searchInput.value === '') clearSearch(); });
    }

    initialize();

    return { show, hide };
}