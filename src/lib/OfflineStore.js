const KEYS = { medicines: 'formatech.offline.medicines', queue: 'formatech.offline.sync-queue', lastSync: 'formatech.offline.last-sync' };

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export const OfflineStore = {
  getMedicines() { return read(KEYS.medicines, []); },
  saveMedicines(items) { write(KEYS.medicines, items || []); return items || []; },
  getQueue() { return read(KEYS.queue, []); },
  enqueue(operation) { const queue = this.getQueue(); queue.push({ ...operation, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() }); write(KEYS.queue, queue); return queue; },
  replaceQueue(queue) { write(KEYS.queue, queue); },
  markSynced() { localStorage.setItem(KEYS.lastSync, new Date().toISOString()); },
  getLastSync() { return localStorage.getItem(KEYS.lastSync); },
};

export function isOfflineError(error) { return !navigator.onLine || !error?.status; }
