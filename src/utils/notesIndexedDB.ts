import type { Note, Notebook, Tag } from '@/types/note';

const DB_NAME = 'DailyHavenNotesDB';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  NOTES: 'notes',
  NOTEBOOKS: 'notebooks',
  TAGS: 'tags',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 */
export async function initNotesDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        notesStore.createIndex('title', 'title', { unique: false });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('notebookId', 'notebookId', { unique: false });
        notesStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        notesStore.createIndex('isArchived', 'isArchived', { unique: false });
        notesStore.createIndex('plainText', 'plainText', { unique: false });
      }

      // Create notebooks store
      if (!db.objectStoreNames.contains(STORES.NOTEBOOKS)) {
        const notebooksStore = db.createObjectStore(STORES.NOTEBOOKS, { keyPath: 'id' });
        notebooksStore.createIndex('name', 'name', { unique: false });
        notebooksStore.createIndex('createdAt', 'createdAt', { unique: false });
        notebooksStore.createIndex('order', 'order', { unique: false });
      }

      // Create tags store
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        const tagsStore = db.createObjectStore(STORES.TAGS, { keyPath: 'id' });
        tagsStore.createIndex('name', 'name', { unique: true });
        tagsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Generic function to get all items from a store
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all from ${storeName}`));
    };
  });
}

/**
 * Generic function to get a single item by ID
 */
export async function getByIdFromStore<T>(storeName: string, id: string): Promise<T | null> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as T || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`));
    };
  });
}

/**
 * Generic function to add/update an item in a store
 */
export async function putInStore<T>(storeName: string, item: T): Promise<void> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to put item in ${storeName}`));
    };
  });
}

/**
 * Generic function to delete an item from a store
 */
export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete item from ${storeName}`));
    };
  });
}

/**
 * Get notes by index
 */
export async function getNotesByIndex(
  indexName: string,
  value: any
): Promise<Note[]> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.NOTES, 'readonly');
    const store = transaction.objectStore(STORES.NOTES);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => {
      resolve(request.result as Note[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get notes by index ${indexName}`));
    };
  });
}

/**
 * Search notes by plain text content
 */
export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllFromStore<Note>(STORES.NOTES);
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.plainText.toLowerCase().includes(lowerQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Count items in a store
 */
export async function countInStore(storeName: string): Promise<number> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Failed to count items in ${storeName}`));
    };
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initNotesDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear ${storeName}`));
    };
  });
}
