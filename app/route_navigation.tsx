import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

const { width, height } = Dimensions.get("window");
const MAP_HEIGHT = height * 0.62;

export default function RouteNavigationScreen() {
  const params = useLocalSearchParams();
  const venue = params.venue ? JSON.parse(params.venue as string) : {};

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude ?? -7.2575},${venue.longitude ?? 112.7521}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      {/* Map ilustrasi — langsung dari atas, tanpa header */}
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>

        <View style={StyleSheet.absoluteFill}>
          <View style={styles.park} />
          <View style={styles.roadV} />
          <View style={styles.roadH1} />
          <View style={styles.roadH2} />
          <View style={styles.roadDiag} />
        </View>

        {/* Rute biru */}
        <View style={styles.routeV} />
        <View style={styles.routeCorner} />
        <View style={styles.routeH} />

        {/* User dot */}
        <View style={styles.userDotWrapper}>
          <View style={styles.userDotRing}>
            <View style={styles.userDotInner} />
          </View>
        </View>

        {/* Destination pin */}
        <View style={styles.destWrapper}>
          <View style={styles.destPin}>
            <Ionicons name="location" size={20} color="#fff" />
          </View>
          <View style={styles.destTail} />
          <View style={styles.destLabel}>
            <Text style={styles.destLabelText}>{venue.name ?? "GOR Arcadia"}</Text>
          </View>
        </View>

        {/* Compass */}
        <TouchableOpacity style={styles.compassButton}>
          <Ionicons name="navigate" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaTime}>~5 menit</Text>
            <Text style={styles.etaDetail}>{venue.distance ?? "1.2 km"} • Rute tercepat</Text>
          </View>
          <View style={styles.compassBtn}>
            <Ionicons name="navigate-outline" size={22} color="#2196F3" />
          </View>
        </View>

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.85} style={styles.mapsButton}>
          <Text style={styles.mapsButtonText}>Buka Google Maps</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.hint}>Akan membuka aplikasi peta eksternal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4EE" },

  // Map
  mapContainer: {
    width: "100%",
    backgroundColor: "#EEF4EE",
    position: "relative",
    overflow: "hidden",
  },

  park: {
    position: "absolute",
    top: MAP_HEIGHT * 0.08,
    left: width * 0.04,
    width: width * 0.42,
    height: MAP_HEIGHT * 0.68,
    borderRadius: 999,
    backgroundColor: "#C8DFC0",
  },
  roadV: {
    position: "absolute",
    top: 0, bottom: 0,
    left: "53%",
    width: 26,
    backgroundColor: "#FFFFFF",
  },
  roadH1: {
    position: "absolute",
    top: "58%",
    left: 0, right: 0,
    height: 22,
    backgroundColor: "#FFFFFF",
  },
  roadH2: {
    position: "absolute",
    top: "80%",
    left: 0, right: 0,
    height: 16,
    backgroundColor: "#FFFFFF",
  },
  roadDiag: {
    position: "absolute",
    top: "28%",
    left: "-8%",
    width: "65%",
    height: 18,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "33deg" }],
  },

  routeV: {
    position: "absolute",
    top: "42%",
    left: "39%",
    width: 5,
    height: "18%",
    backgroundColor: "#2196F3",
    borderRadius: 3,
    zIndex: 2,
  },
  routeCorner: {
    position: "absolute",
    top: "57.5%",
    left: "38.5%",
    width: 14,
    height: 14,
    borderBottomRightRadius: 10,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#2196F3",
    zIndex: 2,
  },
  routeH: {
    position: "absolute",
    top: "58%",
    left: "41%",
    width: "20%",
    height: 5,
    backgroundColor: "#2196F3",
    borderRadius: 3,
    zIndex: 2,
  },

  userDotWrapper: {
    position: "absolute",
    top: "37%",
    left: "36%",
    zIndex: 3,
  },
  userDotRing: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(33,150,243,0.2)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(33,150,243,0.35)",
  },
  userDotInner: {
    width: 13, height: 13, borderRadius: 6.5,
    backgroundColor: "#2196F3",
    borderWidth: 2, borderColor: "#FFFFFF",
  },

  destWrapper: {
    position: "absolute",
    top: "6%",
    left: "60%",
    alignItems: "center",
    zIndex: 3,
  },
  destPin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F59E0B",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  destTail: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#F59E0B",
    marginTop: -1,
  },
  destLabel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    marginTop: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    minWidth: 100,
    alignItems: "center",
  },
  destLabelText: { fontSize: 12, fontWeight: "600", color: "#1A1A2E" },

  compassButton: {
    position: "absolute", bottom: 16, right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 8,
    justifyContent: "space-between",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center", marginBottom: 16,
  },
  etaRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  etaTime: { fontSize: 36, fontWeight: "800", color: "#1A1A2E", marginBottom: 2 },
  etaDetail: { fontSize: 14, color: "#6B7280" },
  compassBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
  },
  mapsButton: {
    height: 56, borderRadius: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#00BFA5",
    marginBottom: 8,
    shadowColor: "#00BFA5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  mapsButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  hint: { textAlign: "center", fontSize: 12, color: "#9CA3AF" },
});