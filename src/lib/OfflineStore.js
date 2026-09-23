const DB_NAME = 'formatech-local-db';
const DB_VERSION = 1;
const STORE = 'state';
const KEYS = { medicines: 'medicines', queue: 'sync-queue', lastSync: 'last-sync' };

let dbPromise;
function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function legacyKey(key) { return `formatech.offline.${key}`; }
function readLegacy(key, fallback) {
  try { return JSON.parse(localStorage.getItem(legacyKey(key)) || JSON.stringify(fallback)); } catch { return fallback; }
}

async function getValue(key, fallback) {
  const db = await openDb();
  if (!db) return readLegacy(key, fallback);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result === undefined ? fallback : request.result);
    request.onerror = () => reject(request.error);
  });
}

async function setValue(key, value) {
  const db = await openDb();
  if (!db) { localStorage.setItem(legacyKey(key), JSON.stringify(value)); return value; }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error);
  });
}

async function migrateLegacyData() {
  const db = await openDb();
  if (!db) return;
  const marker = await getValue('migration-v1', false);
  if (marker) return;
  for (const [key, fallback] of [[KEYS.medicines, []], [KEYS.queue, []]]) {
    const value = readLegacy(key, fallback);
    if (value.length) await setValue(key, value);
  }
  const lastSync = localStorage.getItem(legacyKey(KEYS.lastSync));
  if (lastSync) await setValue(KEYS.lastSync, lastSync);
  await setValue('migration-v1', true);
}

const ready = migrateLegacyData().catch((error) => console.warn('تعذر تجهيز قاعدة البيانات المحلية:', error));

export const OfflineStore = {
  async getMedicines() { await ready; return getValue(KEYS.medicines, []); },
  async saveMedicines(items) { await ready; return setValue(KEYS.medicines, items || []); },
  async getQueue() { await ready; return getValue(KEYS.queue, []); },
  async enqueue(operation) {
    await ready;
    const queue = await getValue(KEYS.queue, []);
    queue.push({ ...operation, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() });
    return setValue(KEYS.queue, queue);
  },
  async replaceQueue(queue) { await ready; return setValue(KEYS.queue, queue || []); },
  async markSynced() { await ready; return setValue(KEYS.lastSync, new Date().toISOString()); },
  async getLastSync() { await ready; return getValue(KEYS.lastSync, null); },
};

export function isOfflineError(error) { return !navigator.onLine || !error?.status; }
