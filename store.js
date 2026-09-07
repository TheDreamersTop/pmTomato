// Audio files live in IndexedDB so they survive a reload. Key is 'work' or 'break'.
const DB = 'pmTomato', STORE = 'files';

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, op) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = op(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  }));
}

export const saveFile = (key, file) => run('readwrite', (s) => s.put(file, key));
export const loadFile = (key) => run('readonly', (s) => s.get(key)).then((f) => f ?? null);
