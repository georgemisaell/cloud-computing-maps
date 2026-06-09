import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi membutuhkan izin lokasi untuk menampilkan tempat terdekat."
        );
        return;
      }
      router.push("/map_view");
    } catch (error) {
      Alert.alert("Error", "Gagal meminta izin lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/map_view");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Map */}
      <View style={styles.mapBackground}>
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
        <View style={styles.roadDiagonal1} />
        <View style={styles.roadDiagonal2} />
        <View style={[styles.mapDot, { top: height * 0.28, left: width * 0.28 }]} />
        <View style={[styles.mapDotSmall, { top: height * 0.14, left: width * 0.58 }]} />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheetWrapper}>
        <View style={styles.bottomSheet}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={32} color="#2196F3" />
          </View>

          <Text style={styles.title}>Izinkan Akses Lokasi</Text>

          <Text style={styles.description}>
            Sport Finder membutuhkan lokasi kamu untuk menampilkan tempat
            terdekat dan menghitung jarak.
          </Text>

          <TouchableOpacity
            onPress={handleAllow}
            activeOpacity={0.85}
            style={[styles.allowButton, loading && { opacity: 0.7 }]}
            disabled={loading}
          >
            <Text style={styles.allowButtonText}>
              {loading ? "Meminta Izin..." : "Izinkan"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            disabled={loading}
          >
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#90A4AE" },

  mapBackground: {
    flex: 1,
    backgroundColor: "#90A4AE",
    position: "relative",
    overflow: "hidden",
  },
  roadHorizontal: {
    position: "absolute",
    top: "40%",
    left: "-20%",
    right: "-20%",
    height: 22,
    backgroundColor: "#ECEFF1",
    borderRadius: 999,
  },
  roadVertical: {
    position: "absolute",
    top: "-10%",
    bottom: "-10%",
    left: "28%",
    width: 22,
    backgroundColor: "#ECEFF1",
    borderRadius: 999,
  },
  roadDiagonal1: {
    position: "absolute",
    top: "5%",
    left: "-30%",
    width: "90%",
    height: 22,
    backgroundColor: "#ECEFF1",
    borderRadius: 999,
    transform: [{ rotate: "40deg" }],
  },
  roadDiagonal2: {
    position: "absolute",
    top: "60%",
    left: "10%",
    width: "100%",
    height: 22,
    backgroundColor: "#ECEFF1",
    borderRadius: 999,
    transform: [{ rotate: "-25deg" }],
  },
  mapDot: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  mapDotSmall: {
    position: "absolute",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  bottomSheetWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    paddingBottom: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
 allowButton: {
  width: width - 88,
  height: 52,
  borderRadius: 16,
  backgroundColor: "#00BFA5",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
},
  allowButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  skipButton: { paddingVertical: 8 },
  skipText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
});