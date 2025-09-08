import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useWatchlist } from "../../hooks/useWatchlist";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome } from "@expo/vector-icons";

export default function WatchlistScreen() {
  const { watchlists, createWatchlist, loadWatchlists, deleteWatchlist } =
    useWatchlist();
  const [newWatchlistName, setNewWatchlistName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadWatchlists();
    }, [])
  );

  const handleCreateWatchlist = () => {
    createWatchlist(newWatchlistName);
    setNewWatchlistName("");
  };

  const watchlistNames = Object.keys(watchlists);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>My Watchlists</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Create new watchlist..."
          value={newWatchlistName}
          onChangeText={setNewWatchlistName}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateWatchlist}
        >
          <Text style={styles.addButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {watchlistNames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No watchlists yet.</ThemedText>
          <ThemedText style={styles.emptySubText}>
            Create one above to get started!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={watchlistNames}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Link href={`/watchlist/${item}`} asChild>
              <TouchableOpacity style={styles.watchlistItem}>
                <ThemedText style={styles.watchlistName}>{item}</ThemedText>
                <TouchableOpacity
                  onPress={() => deleteWatchlist(item)}
                  style={styles.deleteButton}
                >
                  <FontAwesome name="trash-o" size={24} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    paddingTop: 40,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  watchlistItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  watchlistName: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 5,
  },
});
