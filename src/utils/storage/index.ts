import { nanoid } from "nanoid";

export interface Storable {
  id: string; // 저장될 객체는 고유 ID를 갖도록 설계
}

class Storage<T extends Storable> {
  private dbName: string;
  private storeName: string;
  private version: number;

  constructor(dbName: string, storeName: string, version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;

    // 데이터베이스 초기화
    const request = indexedDB.open(this.dbName, this.version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: "id" });
      }
    };
  }

  // CREATE: 데이터 저장
  async add(item: Omit<T, "id">): Promise<string> {
    const id = nanoid();
    const newItem = { ...item, id } as T;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        const addRequest = store.add(newItem);
        addRequest.onsuccess = () => {
          resolve(id);
        };
        addRequest.onerror = () => {
          reject(addRequest.error);
        };
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // READ: 특정 ID의 데이터를 불러옴
  async get(id: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);

        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // UPDATE: 특정 ID의 데이터를 업데이트
  async update(item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        const putRequest = store.put(item);
        putRequest.onsuccess = () => {
          resolve();
        };
        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // DELETE: 특정 ID의 데이터를 삭제
  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        const deleteRequest = store.delete(id);
        deleteRequest.onsuccess = () => {
          resolve();
        };
        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
        };
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export default Storage;
