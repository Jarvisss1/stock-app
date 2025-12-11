import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ALPHA_VANTAGE_API_KEY,
  USE_DEMO_DETAILS_API,
} from "../../constants/ApiKey";
import { mockRelianceOverview } from "../../constants/mockData";
import { useWatchlist } from "../../hooks/useWatchlist";
import LineChart from "../../components/LineChart";
import { FontAwesome } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { getCache, setCache } from "../utils/cache";
import { useTheme } from "../context/ThemeContext";

const ALPHA_VANTAGE_API_KEY_HARD = "YQBL5FEH4FK78QYC";

export default function StockDetailsScreen() {
  const params = useLocalSearchParams<{
    ticker: string;
    name?: string;
    price?: string;
    change?: string;
  }>();
  const ticker = params.ticker;
  const { theme } = useTheme();

  const [details, setDetails] = useState<any>({
    Symbol: params.ticker,
    Name: params.name,
  });
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    watchlists,
    addStockToWatchlist,
    removeStockFromWatchlist,
    isStockInAnyWatchlist,
    loadWatchlists,
    createWatchlist,
  } = useWatchlist();

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadWatchlists();
    }, [])
  );

  useEffect(() => {
    if (ticker) {
      setIsInWatchlist(isStockInAnyWatchlist(ticker));
    }
  }, [watchlists, ticker]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!ticker) return;

      setLoading(true);
      setError(null);

      // Caching logic first
      const overviewCacheKey = `cache_overview_${ticker}`;
      const timeSeriesCacheKey = `cache_timeseries_${ticker}`;
      const cachedOverview = await getCache<any>(overviewCacheKey);
      const cachedTimeSeries = await getCache<any[]>(timeSeriesCacheKey);

      if (cachedOverview && cachedTimeSeries) {
        setDetails(cachedOverview);
        setTimeSeries(cachedTimeSeries);
        setLoading(false);
        return;
      }

      // --- Primary Logic: Try fetching LIVE data ---
      try {
        // Fetch Live Overview
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY_HARD}`;
        const overviewRes = await fetch(overviewUrl);
        const overviewData = await overviewRes.json();
        // Check for rate limit message
        if (
          overviewData.Note ||
          overviewData.Information ||
          !overviewData.Symbol
        ) {
          throw new Error("API_LIMIT"); // Throw a specific error for rate limit
        }
        await setCache(overviewCacheKey, overviewData);
        setDetails(overviewData);

        // Fetch Live Time Series
        const timeSeriesUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY_HARD}`;
        const timeSeriesRes = await fetch(timeSeriesUrl);
        const timeSeriesData = await timeSeriesRes.json();
        const dailyData = timeSeriesData["Time Series (Daily)"];


        if (dailyData) {
          const formattedData = Object.keys(dailyData)
            .map((date) => ({
              date,
              value: parseFloat(dailyData[date]["4. close"]),
            }))
            .reverse();
          await setCache(timeSeriesCacheKey, formattedData);
          setTimeSeries(formattedData);
        } else {
          // Also check for rate limit here
          if (timeSeriesData.Note || timeSeriesData.Information) {
            throw new Error("API_LIMIT");
          }
          throw new Error("Could not fetch live time series data.");
        }
        
      } catch (e: any) {
        // --- Fallback Logic: If live data fails due to rate limit ---
        if (e.message === "API_LIMIT") {
          console.warn("API limit reached. Falling back to demo data.");
          try {
            // Use the mock overview but with the correct ticker symbol and name
            setDetails({
              ...mockRelianceOverview,
              Symbol: ticker,
              Name: params.name || `${ticker} Company`,
            });

            // Fetch the demo time series
            const timeSeriesDemoCacheKey = `cache_timeseries_demo_reliance`;
            const cachedDemoTimeSeries = await getCache<any[]>(
              timeSeriesDemoCacheKey
            );
            if (cachedDemoTimeSeries) {
              setTimeSeries(cachedDemoTimeSeries);
            } else {
              const demoUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=RELIANCE.BSE&outputsize=full&apikey=demo`;
              const demoRes = await fetch(demoUrl);
              const timeSeriesData = await demoRes.json();
              const dailyData = timeSeriesData["Time Series (Daily)"];
              if (dailyData) {
                const formattedData = Object.keys(dailyData)
                  .map((date) => ({
                    date,
                    value: parseFloat(dailyData[date]["4. close"]),
                  }))
                  .reverse();
                await setCache(timeSeriesDemoCacheKey, formattedData);
                setTimeSeries(formattedData);
              } else {
                throw new Error(
                  "Could not fetch fallback demo time series data."
                );
              }
            }
          } catch (fallbackError: any) {
            setError(
              fallbackError.message || "Failed to fetch any stock details."
            );
          }
        } else {
          // Handle other, non-rate-limit errors
          setError(e.message || "Failed to fetch stock details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [ticker]);

  const handleAddToWatchlist = (listName: string) => {
    if (!ticker) return;
    addStockToWatchlist(listName, {
      ticker: ticker,
      price: params.price || details?.Price || "N/A",
      change_percentage: params.change || details?.Change || "0%",
    });
    Alert.alert("Added", `${ticker} added to ${listName}.`);
    setModalVisible(false);
  };

  const handleCreateAndAdd = () => {
    if (newWatchlistName.trim() === "") {
      Alert.alert("Error", "Watchlist name cannot be empty.");
      return;
    }
    createWatchlist(newWatchlistName.trim());
    handleAddToWatchlist(newWatchlistName.trim());
    setNewWatchlistName("");
  };

  const handleWatchlistAction = () => {
    if (!ticker) return;
    if (isInWatchlist) {
      removeStockFromWatchlist(ticker);
      Alert.alert(
        "Removed",
        `${ticker} has been removed from your watchlists.`
      );
    } else {
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.ticker}>{ticker}</ThemedText>
        <ThemedText style={styles.name}>{params.name}</ThemedText>
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const modalBackgroundColor = theme === "dark" ? "#1c1c1e" : "white";
  const inputBackgroundColor = theme === "dark" ? "#2c2c2e" : "#f0f0f0";
  const textColor = theme === "dark" ? "#fff" : "#000";
  const placeholderColor = theme === "dark" ? "#8e8e93" : "#a9a9a9";

  return (
    <>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.headerContainer}>
            <View>
              <ThemedText style={styles.ticker}>{details?.Symbol}</ThemedText>
              <ThemedText style={styles.name}>{details?.Name}</ThemedText>
            </View>
            <TouchableOpacity onPress={handleWatchlistAction}>
              <FontAwesome
                name={isInWatchlist ? "bookmark" : "bookmark-o"}
                size={32}
                color={isInWatchlist ? "#FFD700" : "gray"}
              />
            </TouchableOpacity>
          </View>

          {timeSeries.length > 0 && <LineChart data={timeSeries} />}

          <View style={styles.detailsSection}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            <ThemedText style={styles.description}>
              {details?.Description}
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: modalBackgroundColor },
            ]}
          >
            <ThemedText style={styles.modalTitle}>Add to Watchlist</ThemedText>
            <FlatList
              data={Object.keys(watchlists)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalWatchlistItem}
                  onPress={() => handleAddToWatchlist(item)}
                >
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBackgroundColor, color: textColor },
                ]}
                placeholder="Or create a new one"
                placeholderTextColor={placeholderColor}
                value={newWatchlistName}
                onChangeText={setNewWatchlistName}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleCreateAndAdd}
              >
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ticker: {
    fontSize: 28,
    fontWeight: "bold",
  },
  name: {
    fontSize: 16,
    color: "gray",
  },
  detailsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalWatchlistItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
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
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#2c2c2e",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontWeight: "bold",
  },
});

