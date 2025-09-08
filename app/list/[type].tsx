import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  View,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import StockCard from "../../components/StockCard";
import { getCache } from "../utils/cache";
import { USE_MOCK_DATA } from "../../constants/ApiKey";
import { mockTopGainersLosers } from "../../constants/mockData";
import { useTheme } from "../context/ThemeContext";

type Stock = {
  ticker: string;
  price: string;
  change_percentage: string;
};

const PAGE_SIZE = 10; // Number of items to load per page

export default function ViewAllScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { theme } = useTheme();

  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [displayedStocks, setDisplayedStocks] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screenTitle = type === "gainers" ? "Top Gainers" : "Top Losers";
  const totalPages = Math.ceil(allStocks.length / PAGE_SIZE);

  const loadInitialData = async () => {
    try {
      let data;
      if (USE_MOCK_DATA) {
        data = mockTopGainersLosers;
      } else {
        const cachedData = await getCache<any>("cache_top_gainers_losers");
        if (!cachedData) {
          throw new Error(
            "Data not found. Please refresh on the Explore page."
          );
        }
        data = cachedData;
      }

      const sourceStocks =
        type === "gainers" ? data.top_gainers : data.top_losers;
      setAllStocks(sourceStocks);
      setDisplayedStocks(sourceStocks.slice(0, PAGE_SIZE));
      setCurrentPage(1);
    } catch (e: any) {
      setError(e.message || "Failed to load data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadInitialData();
  }, [type]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData();
  }, [type]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const startIndex = (newPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedStocks(allStocks.slice(startIndex, endIndex));
    setCurrentPage(newPage);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const iconColor = theme === "dark" ? "#fff" : "#000";

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: screenTitle }} />
      <FlatList
        data={displayedStocks}
        keyExtractor={(item, index) => `${item.ticker}-${index}`}
        numColumns={2}
        renderItem={({ item }) => <StockCard stock={item} isWatchlistCard />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>
              Showing page {currentPage} of {totalPages}
            </ThemedText>
          </View>
        }
      />
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.disabledButton,
            ]}
          >
            <FontAwesome name="angle-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </ThemedText>
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.disabledButton,
            ]}
          >
            <FontAwesome name="angle-right" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 20,
  },
  list: {
    paddingHorizontal: 4,
  },
  header: {
    padding: 15,
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    color: "gray",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#333",
  },
  paginationButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.3,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
