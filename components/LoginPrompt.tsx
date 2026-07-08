import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoginPrompt({ message = "Silakan login untuk mengakses fitur ini" }: { message?: string }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={80} color="#9CA3AF" style={styles.icon} />
      <Text style={styles.title}>Akses Dibatasi</Text>
      <Text style={styles.message}>{message}</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Login Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
