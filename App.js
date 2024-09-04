import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import WatchlistScreen from "./screens/WatchlistScreen";
import ComparisonScreen from "./screens/ComparisonScreen";
import StockDetailScreen from "./screens/StockDetailScreen";
import { ThemeProvider } from "./ThemeContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="StockDetail"
      component={StockDetailScreen}
      options={({ route }) => ({ title: route.params.stock.symbol })}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Watchlist") {
                iconName = focused ? "star" : "star-outline";
              } else if (route.name === "Compare") {
                iconName = focused ? "bar-chart" : "bar-chart-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarStyle: {
              height: 70,
              marginHorizontal: 1,
              backgroundColor: "white",
            },
            tabBarLabelStyle: {
              paddingBottom: 10,
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Watchlist"
            component={WatchlistScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Compare"
            component={ComparisonScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
