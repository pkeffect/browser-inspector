// VERSION: 0.1.2
// storage-inspector-ui.js

import { getDataType } from './storage-inspector-api.js';

// --- UI Helper Functions ---
export function showTooltip(tooltipEl, cardEl, message, targetElement, options = {}) {
    const { isWarning = false, duration = 1500 } = options;
    if (!tooltipEl) return;

    clearTimeout(tooltipEl.timer);

    tooltipEl.textContent = message;
    tooltipEl.classList.toggle('warning', isWarning);
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    tooltipEl.style.top = `${targetRect.top - cardRect.top - tooltipEl.offsetHeight - 5}px`;
    tooltipEl.style.left = `${targetRect.left - cardRect.left + (targetRect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
    tooltipEl.classList.add('show');

    if (duration > 0) {
        tooltipEl.timer = setTimeout(() => {
            tooltipEl.classList.remove('show');
        }, duration);
    }
}

export function hideTooltip(tooltipEl) {
    clearTimeout(tooltipEl.timer);
    if (tooltipEl) {
        tooltipEl.classList.remove('show');
    }
}

// --- DOM Rendering Functions ---
export function updateStatsUI(elements, state, usageInBytes) {
    const { itemCountSpan, usageSpan, usageBarFill } = elements;
    const itemCount = state.currentStorage?.length || 0;
    itemCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    const totalKb = (usageInBytes / 1024).toFixed(2);
    usageSpan.textContent = `${totalKb} KB / ${state.STORAGE_LIMIT_KB} KB`;
    const percentage = (totalKb / state.STORAGE_LIMIT_KB) * 100;
    usageBarFill.style.width = `${Math.min(percentage, 100)}%`;
}

export function applyColumnVisibilityUI(tableContainer, columnVisibility) {
    Object.keys(columnVisibility).forEach(col => {
        tableContainer.classList.toggle(`hide-${col}`, !columnVisibility[col]);
    });
}

export function renderItemRowUI(item, isCollapsed, truncateLength) {
    const { key, value } = item;
    const type = getDataType(value);
    const isJson = type === 'object' || type === 'array';
    const isLong = value.length > truncateLength;
    const hasViewer = isJson || (isLong && !isJson);

    const row = document.createElement('tr');
    if (isCollapsed) row.style.display = 'none';
    const displayValue = isLong ? `${value.substring(0, truncateLength)}...` : value;

    row.innerHTML = `
        <td class="col-type"><span class="data-type-badge ${type}">${type}</span></td>
        <td class="col-key key-cell" data-key="${key}" data-type="key">${key}</td>
        <td class="col-value value-cell ${hasViewer ? 'has-viewer' : ''}" data-key="${key}" data-type="value">
            <span class="value-cell-content">${displayValue}</span>
        </td>
        <td class="col-actions">
            ${hasViewer ? `<button class="action-btn view-btn" title="View Full Value" data-key="${key}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>` : ''}
            <button class="action-btn copy-btn" title="Copy Row" data-copy-key="${key}" data-copy-value="${value}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
            <button class="action-btn delete-btn" title="Delete Item" data-key="${key}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </td>
    `;
    return row;
}

export function updateSortIndicatorsUI(thead, sortState) {
    thead.querySelectorAll('.sortable-header').forEach(header => {
        header.classList.remove('asc', 'desc');
        if (header.dataset.sort === sortState.column) {
            header.classList.add(sortState.direction);
        }
    });
}

export function createEditInputUI(cell, originalKey, originalValue, onSave, onCancel) {
    const detectedDataType = getDataType(originalValue);
    cell.innerHTML = '';
    
    if (cell.dataset.type === 'value' && detectedDataType === 'boolean') {
        const select = document.createElement('select');
        select.className = 'edit-input';
        select.innerHTML = `<option value="true">true</option><option value="false">false</option>`;
        select.value = originalValue;
        const save = () => onSave(select.value);
        select.addEventListener('blur', save);
        select.addEventListener('change', save);
        select.addEventListener('keydown', (e) => { if (e.key === 'Escape') onCancel(); });
        cell.appendChild(select);
        select.focus();
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cell.dataset.type === 'key' ? originalKey : originalValue;
        input.className = 'edit-input';
        const save = () => onSave(input.value.trim());
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') onCancel();
        });
        cell.appendChild(input);
        input.focus();
        input.select();
    }
}