// VERSION: 0.1.2
// storage-inspector-revisions.js

const REVISION_PREFIX = '_rev:';
const MAX_REVISIONS = 10; // Maximum number of revisions to keep per key

/**
 * Gets the revision history for a given key from storage.
 * @param {Storage} storage - The storage object (localStorage or sessionStorage).
 * @param {string} key - The original key of the item.
 * @returns {Array} An array of revision objects { timestamp, value }.
 */
export function getRevisions(storage, key) {
    if (!key) return [];
    const revisionKey = REVISION_PREFIX + key;
    try {
        const storedRevisions = storage.getItem(revisionKey);
        if (storedRevisions) {
            const parsed = JSON.parse(storedRevisions);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error(`Error parsing revisions for key "${key}":`, e);
    }
    return [];
}

/**
 * Adds a new revision for a given key, trimming old revisions if necessary.
 * @param {Storage} storage - The storage object.
 * @param {string} key - The original key of the item.
 * @param {string} value - The new value to be saved as a revision.
 */
export function addRevision(storage, key, value) {
    if (!key || value === null || value === undefined) return;

    const revisionKey = REVISION_PREFIX + key;
    let revisions = getRevisions(storage, key);

    // Don't save a revision if it's identical to the latest one
    if (revisions.length > 0 && revisions[revisions.length - 1].value === value) {
        return;
    }

    revisions.push({
        timestamp: new Date().toISOString(),
        value: value
    });

    // Keep only the last MAX_REVISIONS
    if (revisions.length > MAX_REVISIONS) {
        revisions = revisions.slice(revisions.length - MAX_REVISIONS);
    }

    try {
        storage.setItem(revisionKey, JSON.stringify(revisions));
    } catch (e) {
        console.error(`Error saving revisions for key "${key}":`, e);
    }
}