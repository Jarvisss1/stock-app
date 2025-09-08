import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import StockCard from "../../components/StockCard";
import { getCache, setCache } from "../utils/cache";
import { ALPHA_VANTAGE_API_KEY, USE_MOCK_DATA } from "../../constants/ApiKey";
import { mockTopGainersLosers } from "../../constants/mockData";
import { useTheme } from "../context/ThemeContext"; // Import the useTheme hook

type Stock = {
  ticker: string;
  price: string;
  change_percentage: string;
};

export default function ExploreScreen() {
  const { theme } = useTheme(); // Get the current theme
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = "cache_top_gainers_losers";
      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK_DATA) {
          setTopGainers(mockTopGainersLosers.top_gainers);
          setTopLosers(mockTopGainersLosers.top_losers);
          return;
        }

        const cachedData = await getCache<any>(cacheKey);
        if (cachedData) {
          setTopGainers(cachedData.top_gainers);
          setTopLosers(cachedData.top_losers);
          return;
        }

        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information || !data.top_gainers) {
          throw new Error("API limit reached or data not available.");
        }

        await setCache(cacheKey, data);
        setTopGainers(data.top_gainers);
        setTopLosers(data.top_losers);
      } catch (e: any) {
        setError(e.message || "Failed to fetch market data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Define a theme-aware color for the 'View All' link
  const viewAllColor = theme === "dark" ? "#3498db" : "#0a7ea4";

  const renderSection = (
    title: string,
    data: Stock[],
    type: "gainers" | "losers"
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <Link href={`/list/${type}`} asChild>
          <TouchableOpacity>
            {/* Apply the dynamic color here */}
            <ThemedText style={[styles.viewAllText, { color: viewAllColor }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
      <FlatList
        data={data.slice(0, 5)} // Show only the first 5 items horizontally
        keyExtractor={(item) => item.ticker}
        renderItem={({ item }) => <StockCard stock={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {renderSection("Top Gainers", topGainers, "gainers")}
        {renderSection("Top Losers", topLosers, "losers")}
      </ScrollView>
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
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
