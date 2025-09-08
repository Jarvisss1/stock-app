import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "./ThemedText";
import { FontAwesome } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView";

type Stock = {
  ticker: string;
  price: string;
  change_percentage: string;
};

type StockCardProps = {
  stock: Stock;
  isWatchlistCard?: boolean;
  onRemove?: () => void; 
};

export default function StockCard({
  stock,
  isWatchlistCard = false,
  onRemove,
}: StockCardProps) {
  const isGain = !stock.change_percentage?.startsWith("-");
  const changeColor = isGain ? "#2e7d32" : "#c62828"; // Green for gain, red for loss
  const cardStyle = isWatchlistCard ? styles.gridCard : styles.horizontalCard;

  return (
    <View style={cardStyle}>
      <ThemedView style={styles.card}>
        {/* Pass all necessary stock info as params */}
        <Link
          href={{
            pathname: "/stock/[ticker]",
            params: {
              ticker: stock.ticker,
              name: `${stock.ticker} Company`,
              price: stock.price,
              change: stock.change_percentage,
            },
          }}
          asChild
        >
          <TouchableOpacity style={styles.touchableContent}>
            <ThemedText style={styles.ticker}>{stock.ticker}</ThemedText>
            <ThemedText style={styles.price}>${stock.price}</ThemedText>
            <ThemedText style={{ color: changeColor }}>
              {stock.change_percentage}
            </ThemedText>
          </TouchableOpacity>
        </Link>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <FontAwesome name="times-circle" size={24} color="#999" />
          </TouchableOpacity>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    margin: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
  },
  touchableContent: {
    flex: 1,
  },
  horizontalCard: {
    width: 160,
  },
  gridCard: {
    width: "50%",
  },
  ticker: {
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    marginVertical: 5,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
    zIndex: 10,
  },
});
