import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const WATCHLIST_STORAGE_KEY = 'stocks_watchlists';

type Stock = {
  ticker: string;
  price: string;
  change_percentage: string;
};

export type Watchlists = {
  [key: string]: Stock[];
};

export const useWatchlist = () => {
  const [watchlists, setWatchlists] = useState<Watchlists>({});

  const loadWatchlists = useCallback(async () => {
    try {
      const storedWatchlists = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (storedWatchlists) {
        setWatchlists(JSON.parse(storedWatchlists));
      }
    } catch (error) {
      console.error('Failed to load watchlists', error);
    }
  }, []);

  const saveWatchlists = async (newWatchlists: Watchlists) => {
    try {
      await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlists));
      setWatchlists(newWatchlists);
    } catch (error) {
      console.error('Failed to save watchlists', error);
    }
  };
  
  // Renamed to match component calls
  const createWatchlist = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Watchlist name cannot be empty.");
      return;
    }
    if (watchlists[trimmedName]) {
      Alert.alert("Error", "Watchlist with this name already exists.");
      return;
    }
    const newWatchlists = { ...watchlists, [trimmedName]: [] };
    saveWatchlists(newWatchlists);
  };

  const deleteWatchlist = async (name: string) => {
    Alert.alert(
      "Delete Watchlist",
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          const newWatchlists = { ...watchlists };
          delete newWatchlists[name];
          saveWatchlists(newWatchlists);
        }}
      ]
    )
  }

  const addStockToWatchlist = (watchlistName: string, stock: Stock) => {
    const watchlist = watchlists[watchlistName] || [];
    if (watchlist.some(s => s.ticker === stock.ticker)) {
      Alert.alert("Info", `${stock.ticker} is already in this watchlist.`);
      return;
    }
    
    const newWatchlist = [...watchlist, stock];
    const newWatchlists = { ...watchlists, [watchlistName]: newWatchlist };
    saveWatchlists(newWatchlists);
  };

  const removeStockFromSpecificWatchlist = (watchlistName: string, ticker: string) => {
    const newWatchlists = { ...watchlists };
    newWatchlists[watchlistName] = newWatchlists[watchlistName].filter(s => s.ticker !== ticker);
    saveWatchlists(newWatchlists);
  }

  const removeStockFromWatchlist = (ticker: string) => {
    const newWatchlists: Watchlists = {};
    for (const name in watchlists) {
      newWatchlists[name] = watchlists[name].filter(s => s.ticker !== ticker);
    }
    saveWatchlists(newWatchlists);
  };
  
  const isStockInAnyWatchlist = (ticker: string) => {
    for (const name in watchlists) {
      if (watchlists[name].some(s => s.ticker === ticker)) {
        return true;
      }
    }
    return false;
  };

  return {
    watchlists,
    loadWatchlists,
    createWatchlist, // Exporting corrected name
    deleteWatchlist,
    addStockToWatchlist,
    removeStockFromSpecificWatchlist,
    removeStockFromWatchlist,
    isStockInAnyWatchlist,
  };
};

