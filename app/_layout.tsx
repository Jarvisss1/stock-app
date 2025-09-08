import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { AppThemeProvider, useTheme } from "./context/ThemeContext";

// 1. Navigation is moved to its own component
function AppNavigation() {
  // 2. We use our custom hook to get the theme
  const { theme } = useTheme();
  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="stock/[ticker]" options={{ title: "Details" }} />
        <Stack.Screen
          name="watchlist/[name]"
          options={{ title: "Watchlist" }}
        />
        <Stack.Screen name="list/[type]" options={{ title: "View All" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

// 3. The main export just provides the theme context
export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppNavigation />
    </AppThemeProvider>
  );
}
