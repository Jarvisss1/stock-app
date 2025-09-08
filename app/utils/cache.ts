import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

type CacheItem<T> = {
  timestamp: number;
  data: T;
};

export const setCache = async <T>(key: string, data: T): Promise<void> => {
  const item: CacheItem<T> = {
    timestamp: Date.now(),
    data,
  };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Failed to cache data for key "${key}"`, error);
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonItem = await AsyncStorage.getItem(key);
    if (!jsonItem) return null;

    const item: CacheItem<T> = JSON.parse(jsonItem);
    if (Date.now() - item.timestamp > CACHE_EXPIRATION_MS) {
      // Cache expired
      await AsyncStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error(`Failed to retrieve cache for key "${key}"`, error);
    return null;
  }
};

// This line is added to fix the "missing default export" warning.
export default () => null;

