// storage/storage-main.js

import * as api from './storage-api.js';
import * as ui from './storage-ui.js';
import { init as initProfiles } from './storage-profiles.js';
import { addRevision } from './storage-revisions.js';

export function init() {
    const elements = {
        storageCard: document.querySelector('.storage-card'),
        storageTbody: document.getElementById('storage-tbody'),
        storageThead: document.querySelector('.storage-table-container thead'),
        storageTableContainer: document.querySelector('.storage-table-container'),
        tooltip: document.getElementById('storage-tooltip'),
        clearAllBtn: document.getElementById('clear-all-btn'),
        addItemBtn: document.getElementById('add-item-btn'),
        addKeyInput: document.getElementById('add-key-input'),
        addValueInput: document.getElementById('add-value-input'),
        addTypeSelect: document.getElementById('add-type-select'),
        addValueBooleanSelect: document.getElementById('add-value-boolean-select'),
        itemCountSpan: document.getElementById('storage-item-count'),
        usageSpan: document.getElementById('storage-usage'),
        usageBarFill: document.getElementById('usage-bar-fill'),
        refreshBtn: document.getElementById('refresh-storage-btn'),
        searchInput: document.getElementById('storage-search-input'),
        jsonModal: document.getElementById('json-modal'),
        jsonEditArea: document.getElementById('json-edit-area'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalSaveBtn: document.getElementById('modal-save-btn'),
        compareVersionsBtn: document.getElementById('compare-versions-btn'),
        importBtn: document.getElementById('import-btn'),
        importFileInput: document.getElementById('import-file-input'),
        exportBtn: document.getElementById('export-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsDropdown: document.getElementById('settings-dropdown'),
        storageTypeSelect: document.getElementById('storage-type-select'),
        storageTitle: document.getElementById('storage-title'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        manageProfilesBtn: document.getElementById('manage-profiles-btn'),
        profilesDropdown: document.getElementById('profiles-dropdown'),
        profilesModal: document.getElementById('profiles-modal'),
        profilesModalCloseBtn: document.getElementById('profiles-modal-close-btn'),
        profilesList: document.getElementById('profiles-list'),
        // NEW elements for IndexedDB
        idbControls: document.getElementById('idb-controls'),
        idbDatabaseSelect: document.getElementById('idb-database-select'),
        idbObjectStoreSelect: document.getElementById('idb-objectstore-select'),
    };

    if (!elements.storageTbody) { console.error("Storage Inspector initialization failed: Main table body not found."); return; }

    const state = {
        currentStorageType: 'localStorage',
        currentIdbDbName: null,
        currentIdbStoreName: null,
        STORAGE_LIMIT_KB: 10240,
        COLUMN_VISIBILITY_KEY: 'storageWidget_columnVisibility',
        VALUE_TRUNCATE_LENGTH: 100,
        collapsedGroups: {},
        sortState: { column: 'key', direction: 'asc' },
        columnVisibility: { type: true, key: true, value: true, actions: true },
        currentEditingKey: null,
    };
    
    function getIdbParams() {
        return { dbName: state.currentIdbDbName, storeName: state.currentIdbStoreName };
    }

    async function render() {
        elements.storageTbody.innerHTML = '';
        const filterText = elements.searchInput.value.toLowerCase();
        const { grouped, ungrouped } = await api.getStorageItems(state.currentStorageType, filterText, state.sortState, getIdbParams());
        
        Object.keys(grouped).sort().forEach(groupName => {
            const items = grouped[groupName];
            const isCollapsed = state.collapsedGroups[groupName];
            const groupHeader = document.createElement('tr');
            groupHeader.className = `group-header ${isCollapsed ? 'collapsed' : ''}`;
            groupHeader.dataset.group = groupName;
            groupHeader.innerHTML = `<td colspan="4"><span class="group-toggle">▼</span>${groupName} (${items.length})</td>`;
            elements.storageTbody.appendChild(groupHeader);
            items.forEach(item => elements.storageTbody.appendChild(ui.renderItemRowUI(item, isCollapsed, state.VALUE_TRUNCATE_LENGTH)));
        });

        ungrouped.forEach(item => elements.storageTbody.appendChild(ui.renderItemRowUI(item, false, state.VALUE_TRUNCATE_LENGTH)));
        
        const totalItems = Object.values(grouped).reduce((acc, items) => acc + items.length, 0) + ungrouped.length;
        elements.itemCountSpan.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

        if (Object.keys(grouped).length === 0 && ungrouped.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.classList.add('empty-storage-message');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            let storageName = elements.storageTypeSelect.options[elements.storageTypeSelect.selectedIndex].text;
             if(state.currentStorageType === 'indexedDB') {
                 storageName = state.currentIdbStoreName ? `Object store "${state.currentIdbStoreName}"` : 'IndexedDB';
            }
            cell.textContent = filterText ? 'No matching keys found.' : `${storageName} is empty.`;
            emptyRow.appendChild(cell);
            elements.storageTbody.appendChild(emptyRow);
        }

        const isWebStorage = state.currentStorageType === 'localStorage' || state.currentStorageType === 'sessionStorage';
        if (isWebStorage) {
            const usageInBytes = await api.calculateStorageUsage(state.currentStorageType);
            ui.updateStatsUI(elements, state, usageInBytes);
        }
        ui.updateSortIndicatorsUI(elements.storageThead, state.sortState);
    }

    const handleSort = (event) => {
        const header = event.target.closest('.sortable-header');
        if (!header) return;
        const column = header.dataset.sort;
        if (state.sortState.column === column) {
            state.sortState.direction = state.sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortState.column = column;
            state.sortState.direction = 'asc';
        }
        render();
    };

    const handleTableClick = async (event) => {
        const target = event.target.closest('button, td, tr');
        if (!target) return;
        if (target.matches('.group-header, .group-header *')) {
            const groupName = target.closest('.group-header').dataset.group;
            state.collapsedGroups[groupName] = !state.collapsedGroups[groupName];
            render();
            return;
        }
        const key = target.dataset.key || (target.closest('[data-key]') ? target.closest('[data-key]').dataset.key : null);
        if (!key) return;

        if (target.matches('.delete-btn, .delete-btn *')) {
            const storageName = state.currentStorageType === 'indexedDB' ? state.currentIdbStoreName : state.currentStorageType;
            if (confirm(`Are you sure you want to delete "${key}" from ${storageName}?`)) {
                await api.removeItem(state.currentStorageType, key, getIdbParams());
                render();
                ui.showTooltip(elements.tooltip, elements.storageCard, "Deleted!", target);
            }
        } else if (target.matches('.copy-btn, .copy-btn *')) {
            const btn = target.closest('.copy-btn');
            const textToCopy = `"${btn.dataset.copyKey}": ${btn.dataset.copyValue}`;
            navigator.clipboard.writeText(textToCopy)
                .then(() => ui.showTooltip(elements.tooltip, elements.storageCard, "Copied!", btn))
                .catch(err => ui.showTooltip(elements.tooltip, elements.storageCard, "Copy Failed!", btn, { isWarning: true }));
        } else if (target.matches('.view-btn, .view-btn *')) {
            const value = await api.getItem(state.currentStorageType, key, getIdbParams());
            const type = api.getDataType(value);
            state.currentEditingKey = key;
            if (type === 'object' || type === 'array') {
                try { elements.jsonEditArea.value = JSON.stringify(JSON.parse(value), null, 2); } 
                catch (e) { elements.jsonEditArea.value = value; }
            } else {
                elements.jsonEditArea.value = value;
            }
            elements.jsonModal.style.display = 'flex';
            elements.jsonEditArea.focus();
        } else if (target.matches('td[data-type]')) {
            if (target.querySelector('input, select')) return;
            const originalValue = await api.getItem(state.currentStorageType, key, getIdbParams());
            ui.createEditInputUI(target, key, originalValue, async (newValue) => {
                if (target.dataset.type === 'key') {
                    if (newValue && newValue !== key) {
                        await api.setItem(state.currentStorageType, newValue, originalValue, getIdbParams());
                        await api.removeItem(state.currentStorageType, key, getIdbParams());
                    }
                } else {
                    if (originalValue !== newValue) {
                        await api.setItem(state.currentStorageType, key, newValue, getIdbParams());
                    }
                }
                render();
            }, render);
        }
    };

    const handleAddItem = async () => {
        const key = elements.addKeyInput.value.trim();
        const type = elements.addTypeSelect.value;
        let value = (type === 'boolean') ? elements.addValueBooleanSelect.value : elements.addValueInput.value;
        if (key) {
            await api.setItem(state.currentStorageType, key, value, getIdbParams());
            elements.addKeyInput.value = '';
            elements.addValueInput.value = '';
            render();
            elements.addKeyInput.focus();
            ui.showTooltip(elements.tooltip, elements.storageCard, "Item Added!", elements.addItemBtn);
        } else {
            ui.showTooltip(elements.tooltip, elements.storageCard, "Key cannot be empty!", elements.addKeyInput, { isWarning: true });
        }
    };

    const handleClearAll = async () => {
        const storageName = state.currentStorageType === 'indexedDB' ? `the "${state.currentIdbStoreName}" object store` : `${state.currentStorageType}`;
        if (confirm(`Are you sure you want to delete ALL items from ${storageName}? This cannot be undone.`)) {
            await api.clear(state.currentStorageType, getIdbParams());
            render();
            ui.showTooltip(elements.tooltip, elements.storageCard, "Storage Cleared!", elements.clearAllBtn);
        }
    };

    const handleExport = async () => {
        const { ungrouped, grouped } = await api.getStorageItems(state.currentStorageType, '', { column: 'key', direction: 'asc' }, getIdbParams());
        const allItems = [...ungrouped, ...Object.values(grouped).flat()];
        const data = {};
        allItems.forEach(item => {
            if (!item.key.startsWith('_rev:')) data[item.key] = item.value;
        });
        
        if (Object.keys(data).length === 0) {
            ui.showTooltip(elements.tooltip, elements.storageCard, "Storage is empty!", elements.exportBtn, { isWarning: true });
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = state.currentStorageType === 'indexedDB' ? `${state.currentIdbDbName}-${state.currentIdbStoreName}` : state.currentStorageType;
        a.download = `${filename}-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
        ui.showTooltip(elements.tooltip, elements.storageCard, "Exported!", elements.exportBtn);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (typeof data !== 'object' || data === null || Array.isArray(data)) { throw new Error("File must be a valid JSON object."); }
                if (confirm("This will overwrite existing keys. Continue?")) {
                    for (const key in data) {
                        await api.setItem(state.currentStorageType, key, String(data[key]), getIdbParams());
                    }
                    render();
                    ui.showTooltip(elements.tooltip, elements.storageCard, "Imported!", elements.importBtn);
                }
            } catch (err) {
                alert(`Error parsing file: ${err.message}`);
                ui.showTooltip(elements.tooltip, elements.storageCard, "Import Failed!", elements.importBtn, { isWarning: true });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleNewItemTypeChange = () => {
        const selectedType = elements.addTypeSelect.value;
        elements.addValueInput.style.display = selectedType === 'boolean' ? 'none' : 'block';
        elements.addValueBooleanSelect.style.display = selectedType === 'boolean' ? 'block' : 'none';
    };

    const handleColumnVisibilityChange = (event) => {
        const column = event.target.dataset.column;
        if (column) {
            state.columnVisibility[column] = event.target.checked;
            localStorage.setItem(state.COLUMN_VISIBILITY_KEY, JSON.stringify(state.columnVisibility));
            ui.applyColumnVisibilityUI(elements.storageTableContainer, state.columnVisibility);
        }
    };
    
    async function updateIdbControlsUI() {
        const dbNames = await api.idbGetDatabaseNames();
        elements.idbDatabaseSelect.innerHTML = '<option value="">Select Database...</option>';
        dbNames.forEach(name => {
            const option = new Option(name, name);
            elements.idbDatabaseSelect.add(option);
        });
        elements.idbObjectStoreSelect.innerHTML = '<option value="">Select Object Store...</option>';
        elements.idbObjectStoreSelect.disabled = true;
    }

    const handleIdbDatabaseChange = async () => {
        state.currentIdbDbName = elements.idbDatabaseSelect.value;
        state.currentIdbStoreName = null;
        elements.idbObjectStoreSelect.innerHTML = '<option value="">Loading stores...</option>';
        if (state.currentIdbDbName) {
            const storeNames = await api.idbGetObjectStoreNames(state.currentIdbDbName);
            elements.idbObjectStoreSelect.innerHTML = '<option value="">Select Object Store...</option>';
            storeNames.forEach(name => {
                const option = new Option(name, name);
                elements.idbObjectStoreSelect.add(option);
            });
            elements.idbObjectStoreSelect.disabled = storeNames.length === 0;
        } else {
            elements.idbObjectStoreSelect.innerHTML = '<option value="">Select Object Store...</option>';
            elements.idbObjectStoreSelect.disabled = true;
        }
        render();
    };

    const handleIdbObjectStoreChange = () => {
        state.currentIdbStoreName = elements.idbObjectStoreSelect.value;
        elements.clearAllBtn.disabled = !state.currentIdbStoreName;
        render();
    };
    
    const handleStorageTypeChange = () => {
        state.currentStorageType = elements.storageTypeSelect.value;
        const selectedOption = elements.storageTypeSelect.options[elements.storageTypeSelect.selectedIndex];
        elements.storageTitle.textContent = selectedOption.textContent;
        elements.searchInput.value = '';
        state.collapsedGroups = {};

        const isWebStorage = state.currentStorageType === 'localStorage' || state.currentStorageType === 'sessionStorage';
        const isIdb = state.currentStorageType === 'indexedDB';

        elements.saveProfileBtn.style.display = isWebStorage ? 'flex' : 'none';
        elements.manageProfilesBtn.style.display = isWebStorage ? 'flex' : 'none';
        elements.profilesDropdown.style.display = isWebStorage ? 'flex' : 'none';
        elements.compareVersionsBtn.style.display = isWebStorage ? 'flex' : 'none';
        elements.usageSpan.style.display = isWebStorage ? 'inline' : 'none';
        elements.usageBarFill.parentElement.style.display = isWebStorage ? 'block' : 'none';
        
        elements.idbControls.style.display = isIdb ? 'flex' : 'none';
        elements.importBtn.disabled = isIdb;
        elements.clearAllBtn.disabled = isIdb; // Disabled until a store is selected

        if (isIdb) {
            updateIdbControlsUI();
        }

        render();
        ui.showTooltip(elements.tooltip, elements.storageCard, `Switched to ${selectedOption.textContent}`, elements.storageTypeSelect);
    };

    const handleStorageChange = (event) => {
        if (
            (state.currentStorageType === 'localStorage' && event.storageArea === window.localStorage) ||
            (state.currentStorageType === 'sessionStorage' && event.storageArea === window.sessionStorage)
        ) {
            ui.showTooltip(elements.tooltip, elements.storageCard, 'Updated from another tab', elements.refreshBtn);
            render();
        }
    };

    const handleModalSave = async () => {
        if (state.currentEditingKey) {
            const newValue = elements.jsonEditArea.value;
            try {
                const originalValue = await api.getItem(state.currentStorageType, state.currentEditingKey, getIdbParams());
                const type = api.getDataType(originalValue);
                if (type === 'object' || type === 'array') JSON.parse(newValue);
                
                if (originalValue !== null && originalValue !== newValue && (state.currentStorageType === 'localStorage' || state.currentStorageType === 'sessionStorage')) {
                    const storage = state.currentStorageType === 'localStorage' ? window.localStorage : window.sessionStorage;
                    addRevision(storage, state.currentEditingKey, originalValue);
                }
                
                await api.setItem(state.currentStorageType, state.currentEditingKey, newValue, getIdbParams());
                elements.jsonModal.style.display = 'none';
                state.currentEditingKey = null;
                render();
                ui.showTooltip(elements.tooltip, elements.storageCard, "Saved!", elements.modalSaveBtn);
            } catch (e) {
                alert("Invalid JSON format. Please correct it before saving.");
            }
        }
    };
    
    const handleCompareVersions = () => {
        if (!state.currentEditingKey || (state.currentStorageType !== 'localStorage' && state.currentStorageType !== 'sessionStorage')) return;
        const storage = state.currentStorageType === 'localStorage' ? window.localStorage : window.sessionStorage;
        const event = new CustomEvent('open-diff-viewer', {
            bubbles: true,
            detail: {
                storage: storage,
                storageKey: state.currentEditingKey,
                currentJsonText: elements.jsonEditArea.value
            }
        });
        document.dispatchEvent(event);
        elements.jsonModal.style.display = 'none';
    };

    function initialize() {
        const savedVisibility = localStorage.getItem(state.COLUMN_VISIBILITY_KEY);
        if (savedVisibility) {
            try { state.columnVisibility = { ...state.columnVisibility, ...JSON.parse(savedVisibility) }; }
            catch (e) { console.error("Could not parse column visibility settings."); }
        }
        elements.settingsDropdown.querySelectorAll('input[type="checkbox"]').forEach(input => {
            const col = input.dataset.column;
            if (state.columnVisibility[col] !== undefined) input.checked = state.columnVisibility[col];
        });
        ui.applyColumnVisibilityUI(elements.storageTableContainer, state.columnVisibility);

        handleNewItemTypeChange();
        handleStorageTypeChange();
        
        window.addEventListener('storage', handleStorageChange);
        elements.storageTypeSelect.addEventListener('change', handleStorageTypeChange);
        elements.idbDatabaseSelect.addEventListener('change', handleIdbDatabaseChange);
        elements.idbObjectStoreSelect.addEventListener('change', handleIdbObjectStoreChange);
        elements.storageThead.addEventListener('click', handleSort);
        elements.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); elements.settingsDropdown.style.display = elements.settingsDropdown.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', (e) => { if (!elements.settingsBtn.contains(e.target) && !elements.settingsDropdown.contains(e.target)) elements.settingsDropdown.style.display = 'none'; });
        elements.settingsDropdown.addEventListener('change', handleColumnVisibilityChange);
        elements.exportBtn.addEventListener('click', handleExport);
        elements.importBtn.addEventListener('click', () => elements.importFileInput.click());
        elements.importFileInput.addEventListener('change', handleImport);
        elements.clearAllBtn.addEventListener('click', handleClearAll);
        elements.addItemBtn.addEventListener('click', handleAddItem);
        elements.refreshBtn.addEventListener('click', () => { render(); ui.showTooltip(elements.tooltip, elements.storageCard, "Refreshed!", elements.refreshBtn); });
        elements.searchInput.addEventListener('input', render);
        elements.modalCloseBtn.addEventListener('click', () => { elements.jsonModal.style.display = 'none'; state.currentEditingKey = null; });
        elements.modalSaveBtn.addEventListener('click', handleModalSave);
        elements.compareVersionsBtn.addEventListener('click', handleCompareVersions);
        elements.jsonModal.addEventListener('click', (e) => { if (e.target === elements.jsonModal) elements.jsonModal.style.display = 'none'; });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && elements.jsonModal.style.display !== 'none') elements.jsonModal.style.display = 'none'; });
        elements.addKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddItem(); });
        elements.addValueInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddItem(); });
        elements.addTypeSelect.addEventListener('change', handleNewItemTypeChange);
        elements.storageTbody.addEventListener('click', handleTableClick);

        initProfiles({
            saveBtn: elements.saveProfileBtn,
            manageBtn: elements.manageProfilesBtn,
            dropdown: elements.profilesDropdown,
            modal: elements.profilesModal,
            modalCloseBtn: elements.profilesModalCloseBtn,
            modalList: elements.profilesList,
        }, () => state.currentStorageType === 'localStorage' ? window.localStorage : window.sessionStorage, 
           render, 
           (msg, el, opts) => ui.showTooltip(elements.tooltip, elements.storageCard, msg, el, opts));

        render();
    }
    
    initialize();
}