import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: true,
        headerTintColor: "#000000",
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
        tabBarInactiveTintColor: "#8e8e93",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map-sharp" : "map-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart-sharp" : "heart-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-sharp" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}