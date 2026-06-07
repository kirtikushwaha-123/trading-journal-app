const DB_NAME = 'smc-ict-trading-journal-images';
const STORE_NAME = 'screenshots';
const DB_VERSION = 1;
export const LOCAL_IMAGE_PREFIX = 'local-image://';

let dbPromise;

const openDb = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

const transact = async (mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const createLocalImageUrl = (key) => `${LOCAL_IMAGE_PREFIX}${key}`;
export const isLocalImageUrl = (url) => typeof url === 'string' && url.startsWith(LOCAL_IMAGE_PREFIX);
export const getLocalImageKey = (url) => url.replace(LOCAL_IMAGE_PREFIX, '');

export const saveLocalImage = async (key, file) => {
  await transact('readwrite', (store) =>
    store.put(
      {
        blob: file,
        type: file.type,
        name: file.name,
        updatedAt: new Date().toISOString(),
      },
      key,
    ),
  );
  return createLocalImageUrl(key);
};

export const saveLocalDataUrl = async (key, dataUrl) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  await transact('readwrite', (store) =>
    store.put(
      {
        blob,
        type: blob.type,
        name: key.split('/').pop(),
        updatedAt: new Date().toISOString(),
      },
      key,
    ),
  );
  return createLocalImageUrl(key);
};

export const loadLocalImageObjectUrl = async (url) => {
  if (!isLocalImageUrl(url)) return url;
  const item = await transact('readonly', (store) => store.get(getLocalImageKey(url)));
  if (!item?.blob) return '';
  return URL.createObjectURL(item.blob);
};

export const deleteLocalImage = async (url) => {
  if (!isLocalImageUrl(url)) return;
  await transact('readwrite', (store) => store.delete(getLocalImageKey(url)));
};
