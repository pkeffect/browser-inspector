// VERSION: 0.1.0
// Storage Inspector Bookmarklet - Self-contained version
// To use: Create a bookmark with this entire file's contents wrapped in: javascript:(function(){...})();

(function() {
    'use strict';
    
    if (document.getElementById('si-overlay')) {
        document.getElementById('si-overlay').style.display = 'flex';
        return;
    }

    const styles = `
        #si-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
        #si-panel { background: #2a2d30; color: #d1d1d1; width: 90%; max-width: 1000px; height: 80vh; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        #si-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444; }
        #si-header h2 { margin: 0; font-size: 1.2em; display: flex; align-items: center; gap: 10px; }
        #si-domain { display: inline-block; padding: 4px 10px; font-size: 0.75em; background: #3a3a3a; border-radius: 12px; opacity: 0.8; }
        #si-close { background: transparent; border: none; color: #d1d1d1; font-size: 24px; cursor: pointer; padding: 5px 10px; border-radius: 4px; }
        #si-close:hover { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
        #si-controls { display: flex; gap: 8px; padding: 10px 20px; border-bottom: 1px solid #444; flex-wrap: wrap; }
        #si-controls select, #si-controls input, #si-controls button { padding: 6px 12px; background: #3a3a3a; color: #d1d1d1; border: 1px solid #555; border-radius: 6px; font-size: 0.9em; }
        #si-controls button { cursor: pointer; }
        #si-controls button:hover { background: #4a4a4a; }
        #si-search { flex: 1; min-width: 200px; }
        #si-body { flex: 1; overflow: auto; padding: 15px 20px; }
        #si-table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
        #si-table th { text-align: left; padding: 10px; background: #3a3a3a; border-bottom: 2px solid #555; position: sticky; top: 0; cursor: pointer; user-select: none; }
        #si-table th:hover { background: #4a4a4a; }
        #si-table td { padding: 10px; border-bottom: 1px solid #444; word-break: break-all; }
        #si-table tr:hover { background: #333; }
        .si-type-badge { display: inline-block; padding: 2px 6px; font-size: 0.75em; border-radius: 4px; font-weight: 600; color: #fff; }
        .si-type-string { background: #0d6efd; }
        .si-type-number { background: #198754; }
        .si-type-boolean { background: #fd7e14; }
        .si-type-object { background: #6f42c1; }
        .si-action { background: none; border: none; color: #d1d1d1; opacity: 0.6; cursor: pointer; padding: 2px; margin: 0 3px; }
        .si-action:hover { opacity: 1; }
        .si-empty { text-align: center; padding: 40px; opacity: 0.6; font-style: italic; }
        #si-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000000; align-items: center; justify-content: center; }
        #si-modal-content { background: #2a2d30; padding: 20px; border-radius: 10px; width: 600px; max-width: 90%; max-height: 80vh; display: flex; flex-direction: column; }
        #si-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        #si-modal-body { flex: 1; overflow: auto; }
        #si-modal textarea { width: 100%; height: 400px; background: #1a1a1a; color: #d1d1d1; border: 1px solid #555; border-radius: 6px; padding: 10px; font-family: 'Courier New', monospace; font-size: 0.9em; resize: vertical; }
        #si-modal-footer { margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px; }
    `;

    const html = `
        <div id="si-panel">
            <div id="si-header">
                <h2>Storage Inspector <span id="si-domain"></span></h2>
                <button id="si-close">×</button>
            </div>
            <div id="si-controls">
                <select id="si-storage-type">
                    <option value="localStorage">Local Storage</option>
                    <option value="sessionStorage">Session Storage</option>
                </select>
                <input type="search" id="si-search" placeholder="Filter by key...">
                <button id="si-refresh">Refresh</button>
                <button id="si-clear">Clear All</button>
                <button id="si-export">Export</button>
            </div>
            <div id="si-body">
                <table id="si-table">
                    <thead>
                        <tr>
                            <th data-sort="type">Type</th>
                            <th data-sort="key">Key</th>
                            <th data-sort="value">Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="si-tbody"></tbody>
                </table>
            </div>
        </div>
        <div id="si-modal">
            <div id="si-modal-content">
                <div id="si-modal-header">
                    <h3>Edit Value</h3>
                    <button id="si-modal-close">×</button>
                </div>
                <div id="si-modal-body">
                    <textarea id="si-modal-textarea"></textarea>
                </div>
                <div id="si-modal-footer">
                    <button id="si-modal-cancel">Cancel</button>
                    <button id="si-modal-save">Save</button>
                </div>
            </div>
        </div>
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    const overlay = document.createElement('div');
    overlay.id = 'si-overlay';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    const state = {
        currentStorageType: 'localStorage',
        currentEditKey: null,
        sortColumn: 'key',
        sortDirection: 'asc'
    };

    const getStorage = () => state.currentStorageType === 'localStorage' ? localStorage : sessionStorage;
    
    const getDataType = (value) => {
        if (value === 'true' || value === 'false') return 'boolean';
        if (!isNaN(value) && value.trim() !== '') return 'number';
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return 'array';
            if (typeof parsed === 'object') return 'object';
        } catch (e) {}
        return 'string';
    };

    const renderTable = () => {
        const tbody = document.getElementById('si-tbody');
        const search = document.getElementById('si-search').value.toLowerCase();
        const storage = getStorage();
        
        let items = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (search && !key.toLowerCase().includes(search)) continue;
            items.push({ key, value: storage.getItem(key) });
        }

        items.sort((a, b) => {
            let valA, valB;
            if (state.sortColumn === 'type') {
                valA = getDataType(a.value);
                valB = getDataType(b.value);
            } else {
                valA = (a[state.sortColumn] || '').toLowerCase();
                valB = (b[state.sortColumn] || '').toLowerCase();
            }
            if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        tbody.innerHTML = items.length === 0 
            ? '<tr><td colspan="4" class="si-empty">No items found</td></tr>'
            : items.map(item => {
                const type = getDataType(item.value);
                const displayValue = item.value.length > 100 ? item.value.substring(0, 100) + '...' : item.value;
                return `
                    <tr>
                        <td><span class="si-type-badge si-type-${type}">${type}</span></td>
                        <td>${item.key}</td>
                        <td>${displayValue}</td>
                        <td>
                            <button class="si-action" data-action="edit" data-key="${item.key}" title="Edit">✏️</button>
                            <button class="si-action" data-action="copy" data-key="${item.key}" title="Copy">📋</button>
                            <button class="si-action" data-action="delete" data-key="${item.key}" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join('');
    };

    document.getElementById('si-domain').textContent = window.location.hostname || 'localhost';
    document.getElementById('si-close').onclick = () => overlay.style.display = 'none';
    document.getElementById('si-storage-type').onchange = (e) => {
        state.currentStorageType = e.target.value;
        renderTable();
    };
    document.getElementById('si-search').oninput = renderTable;
    document.getElementById('si-refresh').onclick = renderTable;
    document.getElementById('si-clear').onclick = () => {
        if (confirm('Clear all items from ' + state.currentStorageType + '?')) {
            getStorage().clear();
            renderTable();
        }
    };
    document.getElementById('si-export').onclick = () => {
        const storage = getStorage();
        const data = {};
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            data[key] = storage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentStorageType}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    document.getElementById('si-table').addEventListener('click', (e) => {
        const th = e.target.closest('th[data-sort]');
        if (th) {
            const col = th.dataset.sort;
            state.sortDirection = state.sortColumn === col && state.sortDirection === 'asc' ? 'desc' : 'asc';
            state.sortColumn = col;
            renderTable();
            return;
        }

        const action = e.target.closest('[data-action]');
        if (!action) return;
        
        const key = action.dataset.key;
        const storage = getStorage();

        switch (action.dataset.action) {
            case 'edit':
                state.currentEditKey = key;
                document.getElementById('si-modal-textarea').value = storage.getItem(key);
                document.getElementById('si-modal').style.display = 'flex';
                break;
            case 'copy':
                navigator.clipboard.writeText(storage.getItem(key));
                break;
            case 'delete':
                if (confirm(`Delete "${key}"?`)) {
                    storage.removeItem(key);
                    renderTable();
                }
                break;
        }
    });

    document.getElementById('si-modal-close').onclick = document.getElementById('si-modal-cancel').onclick = () => {
        document.getElementById('si-modal').style.display = 'none';
        state.currentEditKey = null;
    };

    document.getElementById('si-modal-save').onclick = () => {
        if (state.currentEditKey) {
            const newValue = document.getElementById('si-modal-textarea').value;
            getStorage().setItem(state.currentEditKey, newValue);
            document.getElementById('si-modal').style.display = 'none';
            state.currentEditKey = null;
            renderTable();
        }
    };

    document.getElementById('si-modal').onclick = (e) => {
        if (e.target === document.getElementById('si-modal')) {
            document.getElementById('si-modal').style.display = 'none';
        }
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    };

    renderTable();
})();
```

---

## Bookmarklet Instructions

**Minified bookmarklet** (copy this entire line as bookmark URL):
```
javascript:(function(){'use strict';if(document.getElementById('si-overlay')){document.getElementById('si-overlay').style.display='flex';return}const s=`#si-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}#si-panel{background:#2a2d30;color:#d1d1d1;width:90%;max-width:1000px;height:80vh;border-radius:10px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5)}#si-header{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #444}#si-header h2{margin:0;font-size:1.2em;display:flex;align-items:center;gap:10px}#si-domain{display:inline-block;padding:4px 10px;font-size:0.75em;background:#3a3a3a;border-radius:12px;opacity:0.8}#si-close{background:transparent;border:none;color:#d1d1d1;font-size:24px;cursor:pointer;padding:5px 10px;border-radius:4px}#si-close:hover{background:rgba(220,53,69,0.1);color:#dc3545}#si-controls{display:flex;gap:8px;padding:10px 20px;border-bottom:1px solid #444;flex-wrap:wrap}#si-controls select,#si-controls input,#si-controls button{padding:6px 12px;background:#3a3a3a;color:#d1d1d1;border:1px solid #555;border-radius:6px;font-size:0.9em}#si-controls button{cursor:pointer}#si-controls button:hover{background:#4a4a4a}#si-search{flex:1;min-width:200px}#si-body{flex:1;overflow:auto;padding:15px 20px}#si-table{width:100%;border-collapse:collapse;font-size:0.85em}#si-table th{text-align:left;padding:10px;background:#3a3a3a;border-bottom:2px solid #555;position:sticky;top:0;cursor:pointer;user-select:none}#si-table th:hover{background:#4a4a4a}#si-table td{padding:10px;border-bottom:1px solid #444;word-break:break-all}#si-table tr:hover{background:#333}.si-type-badge{display:inline-block;padding:2px 6px;font-size:0.75em;border-radius:4px;font-weight:600;color:#fff}.si-type-string{background:#0d6efd}.si-type-number{background:#198754}.si-type-boolean{background:#fd7e14}.si-type-object{background:#6f42c1}.si-action{background:none;border:none;color:#d1d1d1;opacity:0.6;cursor:pointer;padding:2px;margin:0 3px}.si-action:hover{opacity:1}.si-empty{text-align:center;padding:40px;opacity:0.6;font-style:italic}#si-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1000000;align-items:center;justify-content:center}#si-modal-content{background:#2a2d30;padding:20px;border-radius:10px;width:600px;max-width:90%;max-height:80vh;display:flex;flex-direction:column}#si-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}#si-modal-body{flex:1;overflow:auto}#si-modal textarea{width:100%;height:400px;background:#1a1a1a;color:#d1d1d1;border:1px solid #555;border-radius:6px;padding:10px;font-family:'Courier New',monospace;font-size:0.9em;resize:vertical}#si-modal-footer{margin-top:15px;display:flex;justify-content:flex-end;gap:10px}`;const h=`<div id="si-panel"><div id="si-header"><h2>Storage Inspector <span id="si-domain"></span></h2><button id="si-close">×</button></div><div id="si-controls"><select id="si-storage-type"><option value="localStorage">Local Storage</option><option value="sessionStorage">Session Storage</option></select><input type="search" id="si-search" placeholder="Filter by key..."><button id="si-refresh">Refresh</button><button id="si-clear">Clear All</button><button id="si-export">Export</button></div><div id="si-body"><table id="si-table"><thead><tr><th data-sort="type">Type</th><th data-sort="key">Key</th><th data-sort="value">Value</th><th>Actions</th></tr></thead><tbody id="si-tbody"></tbody></table></div></div><div id="si-modal"><div id="si-modal-content"><div id="si-modal-header"><h3>Edit Value</h3><button id="si-modal-close">×</button></div><div id="si-modal-body"><textarea id="si-modal-textarea"></textarea></div><div id="si-modal-footer"><button id="si-modal-cancel">Cancel</button><button id="si-modal-save">Save</button></div></div></div>`;const e=document.createElement('style');e.textContent=s;document.head.appendChild(e);const o=document.createElement('div');o.id='si-overlay';o.innerHTML=h;document.body.appendChild(o);const t={currentStorageType:'localStorage',currentEditKey:null,sortColumn:'key',sortDirection:'asc'};const g=()=>t.currentStorageType==='localStorage'?localStorage:sessionStorage;const d=(v)=>{if(v==='true'||v==='false')return'boolean';if(!isNaN(v)&&v.trim()!=='')return'number';try{const p=JSON.parse(v);if(Array.isArray(p))return'array';if(typeof p==='object')return'object'}catch(e){}return'string'};const r=()=>{const b=document.getElementById('si-tbody');const c=document.getElementById('si-search').value.toLowerCase();const a=g();let i=[];for(let x=0;x<a.length;x++){const k=a.key(x);if(c&&!k.toLowerCase().includes(c))continue;i.push({key:k,value:a.getItem(k)})}i.sort((a,b)=>{let va,vb;if(t.sortColumn==='type'){va=d(a.value);vb=d(b.value)}else{va=(a[t.sortColumn]||'').toLowerCase();vb=(b[t.sortColumn]||'').toLowerCase()}if(va<vb)return t.sortDirection==='asc'?-1:1;if(va>vb)return t.sortDirection==='asc'?1:-1;return 0});b.innerHTML=i.length===0?'<tr><td colspan="4" class="si-empty">No items found</td></tr>':i.map(item=>{const tp=d(item.value);const dv=item.value.length>100?item.value.substring(0,100)+'...':item.value;return`<tr><td><span class="si-type-badge si-type-${tp}">${tp}</span></td><td>${item.key}</td><td>${dv}</td><td><button class="si-action" data-action="edit" data-key="${item.key}" title="Edit">✏️</button><button class="si-action" data-action="copy" data-key="${item.key}" title="Copy">📋</button><button class="si-action" data-action="delete" data-key="${item.key}" title="Delete">🗑️</button></td></tr>`}).join('')};document.getElementById('si-domain').textContent=window.location.hostname||'localhost';document.getElementById('si-close').onclick=()=>o.style.display='none';document.getElementById('si-storage-type').onchange=(e)=>{t.currentStorageType=e.target.value;r()};document.getElementById('si-search').oninput=r;document.getElementById('si-refresh').onclick=r;document.getElementById('si-clear').onclick=()=>{if(confirm('Clear all items from '+t.currentStorageType+'?')){g().clear();r()}};document.getElementById('si-export').onclick=()=>{const a=g();const data={};for(let i=0;i<a.length;i++){const k=a.key(i);data[k]=a.getItem(k)}const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download=`${t.currentStorageType}_${Date.now()}.json`;l.click();URL.revokeObjectURL(u)};document.getElementById('si-table').addEventListener('click',(e)=>{const th=e.target.closest('th[data-sort]');if(th){const c=th.dataset.sort;t.sortDirection=t.sortColumn===c&&t.sortDirection==='asc'?'desc':'asc';t.sortColumn=c;r();return}const ac=e.target.closest('[data-action]');if(!ac)return;const k=ac.dataset.key;const a=g();switch(ac.dataset.action){case'edit':t.currentEditKey=k;document.getElementById('si-modal-textarea').value=a.getItem(k);document.getElementById('si-modal').style.display='flex';break;case'copy':navigator.clipboard.writeText(a.getItem(k));break;case'delete':if(confirm(`Delete "${k}"?`)){a.removeItem(k);r()}break}});document.getElementById('si-modal-close').onclick=document.getElementById('si-modal-cancel').onclick=()=>{document.getElementById('si-modal').style.display='none';t.currentEditKey=null};document.getElementById('si-modal-save').onclick=()=>{if(t.currentEditKey){const v=document.getElementById('si-modal-textarea').value;g().setItem(t.currentEditKey,v);document.getElementById('si-modal').style.display='none';t.currentEditKey=null;r()}};document.getElementById('si-modal').onclick=(e)=>{if(e.target===document.getElementById('si-modal')){document.getElementById('si-modal').style.display='none'}};o.onclick=(e)=>{if(e.target===o)o.style.display='none'};r()})();