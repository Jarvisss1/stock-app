import React, { useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useFocusEffect, Stack } from "expo-router";
import { useWatchlist } from "../../hooks/useWatchlist";
import StockCard from "../../components/StockCard";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function WatchlistDetailsScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { watchlists, loadWatchlists, removeStockFromSpecificWatchlist } =
    useWatchlist();

  useFocusEffect(
    useCallback(() => {
      loadWatchlists();
    }, [])
  );

  const stocks = name ? watchlists[name] || [] : [];
  console.log("Stocks in watchlist:", stocks);
  

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: name }} />
      {stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            This watchlist is empty.
          </ThemedText>
          <ThemedText style={styles.emptySubText}>
            Add stocks from the explore page.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.ticker}
          numColumns={2}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              isWatchlistCard
              onRemove={() =>
                name && removeStockFromSpecificWatchlist(name, item.ticker)
              }
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "gray",
  },
  emptySubText: {
    fontSize: 14,
    color: "darkgray",
    marginTop: 5,
  },
});
