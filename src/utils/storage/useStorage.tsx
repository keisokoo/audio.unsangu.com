import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import Storage, { Storable } from "./index";

export function useStorage<T extends Storable>(
  defaultItem: Readonly<T>,
  dbConfigs: {
    dbName: string;
    storeName: string;
    version?: number;
  }
) {
  if (!dbConfigs.version) {
    dbConfigs.version = 1;
  }
  const { dbName, storeName, version } = dbConfigs;
  const [storage] = useState(() => new Storage<T>(dbName, storeName, version));
  const [items, setItems] = useState<T[]>([]);
  const [currentItem, setCurrentItem] = useState<T | null>(defaultItem);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 모든 아이템을 불러오는 함수 - useCallback으로 메모이제이션
  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const request = indexedDB.open(dbName, version);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const allItems = getAllRequest.result;
          setItems(allItems);
          setLoading(false);
          if (allItems.length > 0) {
            setCurrentItem(allItems[0]);
          }
        };
        getAllRequest.onerror = () => {
          setError(getAllRequest.error);
          setLoading(false);
        };
      };
      request.onerror = () => {
        setError(request.error);
        setLoading(false);
      };
    } catch (e) {
      setError(e as Error);
      setLoading(false);
    }
  }, [dbName, storeName, version]);

  // CREATE: 데이터 추가 함수
  const addItem = useCallback(
    async (item: Omit<Partial<T>, "id">): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const id = nanoid();
        const newItem = { ...defaultItem, ...item, id } as T;
        await storage.add(newItem);
        setItems((prevItems) => [...prevItems, newItem]);
        setLoading(false);
        setCurrentItem(newItem);
        return newItem;
      } catch (e) {
        setError(e as Error);
        setLoading(false);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storage]
  );

  // READ: 특정 ID의 데이터를 불러오는 함수
  const getItem = useCallback(
    async (id: string): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const item = await storage.get(id);
        setLoading(false);
        setCurrentItem(item);
        return item;
      } catch (e) {
        setError(e as Error);
        setLoading(false);
        return null;
      }
    },
    [storage]
  );

  // UPDATE: 데이터 업데이트 함수
  const updateItem = useCallback(
    async (item: T) => {
      setLoading(true);
      setError(null);
      try {
        await storage.update(item);
        setItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id ? item : prevItem
          )
        );
        setLoading(false);
        setCurrentItem(item);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    },
    [storage]
  );

  // DELETE: 데이터 삭제 함수
  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await storage.delete(id);
        const newItems = items.filter((item) => item.id !== id);
        setItems(newItems);
        setLoading(false);
        setCurrentItem((prev) => {
          if (prev?.id === id) {
            return newItems[0] || null;
          }
          return prev;
        });
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    },
    [storage, items]
  );

  // 처음에 모든 아이템 로드
  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  return {
    currentItem,
    setCurrentItem,
    items,
    loading,
    error,
    addItem,
    getItem,
    updateItem,
    deleteItem,
    fetchAllItems,
  };
}
