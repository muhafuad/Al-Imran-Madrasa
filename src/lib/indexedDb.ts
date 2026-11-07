/**
 * Al-Imran Madrasa ERP - Advanced IndexedDB Storage Engine
 * High-Capacity, Asynchronous, Non-Blocking Local-First Database
 * Supports Multi-Gigabyte storage, binary Audio Blobs, and Offline Caching.
 */

const DB_NAME = "AlImranMadrasaDB";
const DB_VERSION = 2;

const STORE_KV = "key_value";
const STORE_MEDIA = "media_blobs";
const STORE_OUTBOX = "sync_outbox";

interface MediaBlobRecord {
  id: string;
  blob: Blob | ArrayBuffer;
  mimeType: string;
  meta?: Record<string, any>;
  updatedAt: string;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase | null> | null = null;

const isIndexedDBAvailable = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.indexedDB !== "undefined"
  );
};

/**
 * Initialize or get active IndexedDB instance
 */
export const getIDB = async (): Promise<IDBDatabase | null> => {
  if (!isIndexedDBAvailable()) return null;
  if (dbInstance) return dbInstance;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Key-Value store for all collection records
        if (!db.objectStoreNames.contains(STORE_KV)) {
          db.createObjectStore(STORE_KV, { keyPath: "key" });
        }

        // Binary Media Blobs store for audio recitations, photos & PDFs
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          const mediaStore = db.createObjectStore(STORE_MEDIA, {
            keyPath: "id",
          });
          mediaStore.createIndex("mimeType", "mimeType", { unique: false });
          mediaStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Outbox store for offline mutation sync queue
        if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
          const outboxStore = db.createObjectStore(STORE_OUTBOX, {
            keyPath: "id",
            autoIncrement: true,
          });
          outboxStore.createIndex("table", "table", { unique: false });
          outboxStore.createIndex("action", "action", { unique: false });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.warn(
          "[IndexedDB] Failed to open database, falling back to localStorage:",
          e,
        );
        resolve(null);
      };

      request.onblocked = () => {
        console.warn("[IndexedDB] Database upgrade blocked by another tab.");
      };
    } catch (err) {
      console.warn("[IndexedDB] Initialization exception:", err);
      resolve(null);
    }
  });

  return dbInitPromise;
};

/**
 * Asynchronously save a collection or key to IndexedDB (with localStorage fallback mirror)
 */
export const idbSet = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    // 1. Save to IndexedDB
    const db = await getIDB();
    if (db) {
      const tx = db.transaction(STORE_KV, "readwrite");
      const store = tx.objectStore(STORE_KV);
      store.put({ key, value, updatedAt: new Date().toISOString() });
    }

    // 2. Mirror lightweight keys to localStorage for instant synchronous boots if available
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const jsonStr = JSON.stringify(value);
        // Only mirror if under safe localStorage payload limit (~1.5MB)
        if (jsonStr.length < 1500000) {
          window.localStorage.setItem(key, jsonStr);
        }
      }
    } catch {
      // localStorage quota exceeded is safely ignored since IndexedDB has the true data
    }

    return true;
  } catch (err) {
    console.warn(`[IndexedDB] Error setting key ${key}:`, err);
    return false;
  }
};

/**
 * Asynchronously get a collection or key from IndexedDB (with fallback)
 */
export const idbGet = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const db = await getIDB();
    if (db) {
      return new Promise<T>((resolve) => {
        try {
          const tx = db.transaction(STORE_KV, "readonly");
          const store = tx.objectStore(STORE_KV);
          const request = store.get(key);

          request.onsuccess = () => {
            if (request.result && request.result.value !== undefined) {
              resolve(request.result.value as T);
            } else {
              // Fallback to localStorage if not yet migrated
              resolve(getLocalStorageFallback(key, defaultValue));
            }
          };

          request.onerror = () => {
            resolve(getLocalStorageFallback(key, defaultValue));
          };
        } catch {
          resolve(getLocalStorageFallback(key, defaultValue));
        }
      });
    }
  } catch (err) {
    console.warn(`[IndexedDB] Error reading key ${key}:`, err);
  }

  return getLocalStorageFallback(key, defaultValue);
};

const getLocalStorageFallback = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined" || !window.localStorage)
    return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Delete a key from IndexedDB
 */
export const idbDelete = async (key: string): Promise<boolean> => {
  try {
    const db = await getIDB();
    if (db) {
      const tx = db.transaction(STORE_KV, "readwrite");
      tx.objectStore(STORE_KV).delete(key);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Save an audio recitation or image binary Blob to IndexedDB
 */
export const idbSaveMediaBlob = async (
  id: string,
  blob: Blob | ArrayBuffer,
  mimeType: string = "audio/webm",
  meta?: Record<string, any>,
): Promise<boolean> => {
  try {
    const db = await getIDB();
    if (!db) return false;

    const record: MediaBlobRecord = {
      id,
      blob,
      mimeType,
      meta,
      updatedAt: new Date().toISOString(),
    };

    return new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_MEDIA, "readwrite");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("[IndexedDB] Error saving media blob:", err);
    return false;
  }
};

/**
 * Retrieve a binary Blob by ID
 */
export const idbGetMediaBlob = async (
  id: string,
): Promise<{ blob: Blob; mimeType: string; meta?: any } | null> => {
  try {
    const db = await getIDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MEDIA, "readonly");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result) {
          const rawBlob = req.result.blob;
          const blobObj =
            rawBlob instanceof Blob
              ? rawBlob
              : new Blob([rawBlob], {
                  type: req.result.mimeType || "audio/webm",
                });

          resolve({
            blob: blobObj,
            mimeType: req.result.mimeType,
            meta: req.result.meta,
          });
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Create a live Object URL for direct <audio> or <img> playback
 */
export const idbGetMediaUrl = async (id: string): Promise<string | null> => {
  const result = await idbGetMediaBlob(id);
  if (!result || !result.blob) return null;
  return URL.createObjectURL(result.blob);
};

/**
 * Get device storage estimation (used MB, available GB)
 */
export const idbGetStorageEstimate = async (): Promise<{
  usageMB: number;
  quotaMB: number;
  percentUsed: number;
  isUnlimited: boolean;
}> => {
  if (
    typeof navigator !== "undefined" &&
    navigator.storage &&
    navigator.storage.estimate
  ) {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      const usageMB = Math.round((usage / (1024 * 1024)) * 100) / 100;
      const quotaMB = Math.round((quota / (1024 * 1024)) * 100) / 100;
      const percentUsed =
        quota > 0 ? Math.round((usage / quota) * 10000) / 100 : 0;

      return {
        usageMB,
        quotaMB,
        percentUsed,
        isUnlimited: quotaMB > 500, // IndexedDB typically provides hundreds of Megabytes to Gigabytes
      };
    } catch {
      // ignore
    }
  }

  return {
    usageMB: 0,
    quotaMB: 50,
    percentUsed: 0,
    isUnlimited: false,
  };
};

/**
 * Export full database JSON snapshot
 */
export const idbExportFullSnapshot = async (): Promise<string> => {
  const db = await getIDB();
  if (!db) return "{}";

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_KV, "readonly");
    const store = tx.objectStore(STORE_KV);
    const req = store.getAll();

    req.onsuccess = () => {
      const records = req.result || [];
      const snapshot: Record<string, any> = {};
      records.forEach((r: any) => {
        snapshot[r.key] = r.value;
      });
      resolve(JSON.stringify(snapshot, null, 2));
    };

    req.onerror = () => resolve("{}");
  });
};
