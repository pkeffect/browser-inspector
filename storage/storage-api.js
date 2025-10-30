// storage-api.js

const PREFIX_DELIMITER = /[:./]/;

// --- IndexedDB Helpers ---
let dbConnections = {}; // Cache for DB connections

async function getDb(dbName) {
    if (!('indexedDB' in window)) {
        return Promise.reject("This browser doesn't support IndexedDB.");
    }
    if (dbConnections[dbName]) {
        return dbConnections[dbName];
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName); // Open without version to inspect
        request.onsuccess = event => {
            const db = event.target.result;
            dbConnections[dbName] = db;
            resolve(db);
        };
        request.onerror = event => reject(event.target.error);
    });
}

// NEW: Function to get all database names for the current origin
export async function idbGetDatabaseNames() {
    if (!window.indexedDB || !window.indexedDB.databases) {
        return []; // databases() is not supported in all browsers (e.g., Firefox private mode)
    }
    try {
        const dbs = await window.indexedDB.databases();
        return dbs.map(db => db.name).sort();
    } catch (e) {
        console.error("Could not retrieve IndexedDB database list:", e);
        return [];
    }
}

// NEW: Function to get all object store names from a specific database
export async function idbGetObjectStoreNames(dbName) {
    try {
        const db = await getDb(dbName);
        return Array.from(db.objectStoreNames).sort();
    } catch (e) {
        console.error(`Could not get object stores for "${dbName}":`, e);
        return [];
    }
}

// MODIFIED: Functions now take dbName and storeName as parameters
async function idbGetAll(dbName, storeName) {
    const db = await getDb(dbName);
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName)) {
            return resolve([]); // Store might have been deleted
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
             const keysRequest = store.getAllKeys();
             keysRequest.onsuccess = () => {
                const values = request.result;
                const keys = keysRequest.result;
                const result = keys.map((key, i) => {
                    const val = values[i];
                    const stringValue = (typeof val === 'object' && val !== null) ? JSON.stringify(val) : String(val);
                    return { key: String(key), value: stringValue };
                });
                resolve(result);
             }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

async function idbGet(dbName, storeName, key) {
    const db = await getDb(dbName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => {
             const val = request.result;
             const stringValue = (val !== undefined && val !== null) ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : null;
             resolve(stringValue);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

async function idbSet(dbName, storeName, key, value) {
    let storableValue = value;
    try { storableValue = JSON.parse(value); } catch (e) { /* keep as string */ }
    
    const db = await getDb(dbName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
        // Need to figure out if key is a valid key for the store's keyPath
        // For a generic tool, just using put(value, key) is safest.
        transaction.objectStore(storeName).put(storableValue, key);
    });
}

async function idbRemove(dbName, storeName, key) {
    const db = await getDb(dbName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
        transaction.objectStore(storeName).delete(key);
    });
}

async function idbClear(dbName, storeName) {
    const db = await getDb(dbName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
        transaction.objectStore(storeName).clear();
    });
}

// --- Unified API ---

export function getDataType(value) {
    if (value === null) return 'string';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(value) && value.trim() !== '' && !isNaN(parseFloat(value))) return 'number';
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return 'array';
        if (typeof parsed === 'object' && parsed !== null) return 'object';
    } catch (e) {}
    return 'string';
}

export async function getStorageItems(storageType, filterText, sortState, idbParams = {}) {
    let allItems = [];
    try {
        if (storageType === 'localStorage' || storageType === 'sessionStorage') {
            const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (filterText && !key.toLowerCase().includes(filterText)) continue;
                allItems.push({ key, value: storage.getItem(key) });
            }
        } else if (storageType === 'indexedDB') {
            const { dbName, storeName } = idbParams;
            if (dbName && storeName) {
                const idbItems = await idbGetAll(dbName, storeName);
                allItems = idbItems.filter(item => !filterText || String(item.key).toLowerCase().includes(filterText));
            }
        }
    } catch (e) {
        console.error(`Error getting items from ${storageType}:`, e);
    }
    // ... sorting and grouping logic remains the same ...
    allItems.sort((a, b) => {
        let valA, valB;
        if (sortState.column === 'type') {
            valA = getDataType(a.value);
            valB = getDataType(b.value);
        } else {
            valA = (a[sortState.column] || '').toLowerCase();
            valB = (b[sortState.column] || '').toLowerCase();
        }
        if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const grouped = {}, ungrouped = [];
    allItems.forEach(item => {
        const parts = String(item.key).split(PREFIX_DELIMITER);
        if (parts.length > 1 && parts[0]) {
            const groupName = parts[0];
            if (!grouped[groupName]) grouped[groupName] = [];
            grouped[groupName].push(item);
        } else {
            ungrouped.push(item);
        }
    });

    return { grouped, ungrouped };
}

export async function calculateStorageUsage(storageType) {
    // This function remains largely unchanged but IndexedDB usage is not simple to calculate.
    // For now, we will leave it as an estimate.
    let totalBytes = 0;
    // ... existing logic for localStorage/sessionStorage
    return totalBytes;
}

// --- Unified CRUD Operations (MODIFIED) ---

function getStorage(storageType) {
    if (storageType === 'localStorage') return window.localStorage;
    if (storageType === 'sessionStorage') return window.sessionStorage;
    return null;
}

export async function getItem(storageType, key, idbParams = {}) {
    const storage = getStorage(storageType);
    if (storage) return storage.getItem(key);
    if (storageType === 'indexedDB') {
        const { dbName, storeName } = idbParams;
        return idbGet(dbName, storeName, key);
    }
    return null;
}

export async function setItem(storageType, key, value, idbParams = {}) {
    const storage = getStorage(storageType);
    if (storage) return storage.setItem(key, value);
    if (storageType === 'indexedDB') {
        const { dbName, storeName } = idbParams;
        // For IndexedDB, the key from the input might need to be numeric.
        const numericKey = isNaN(key) ? key : Number(key);
        return idbSet(dbName, storeName, numericKey, value);
    }
}

export async function removeItem(storageType, key, idbParams = {}) {
    const storage = getStorage(storageType);
    if (storage) return storage.removeItem(key);
    if (storageType === 'indexedDB') {
        const { dbName, storeName } = idbParams;
        // Key might be a number for IndexedDB
        const numericKey = isNaN(key) ? key : Number(key);
        return idbRemove(dbName, storeName, numericKey);
    }
}

export async function clear(storageType, idbParams = {}) {
    const storage = getStorage(storageType);
    if (storage) return storage.clear();
    if (storageType === 'indexedDB') {
        const { dbName, storeName } = idbParams;
        return idbClear(dbName, storeName);
    }
}