import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

export type Venue = {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  status: "Buka" | "Tutup";
  price: string;
  sport: string;
};

export default function VenuePreviewScreen() {
  const params = useLocalSearchParams();
  const venue: Venue = params.venue ? JSON.parse(params.venue as string) : null;
  const [searchText, setSearchText] = useState("");

  const handleLihatDetail = () => {
    router.push({
      pathname: "/detail_tempat",
      params: { venue: JSON.stringify(venue) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4EE" />

      {/* Map Background */}
      <View style={styles.mapBackground}>
        <View style={styles.mapGrid}>
          {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
            <View key={`v${i}`} style={[styles.mapLineV, { left: `${x * 100}%` }]} />
          ))}
          {[0.15, 0.3, 0.45, 0.6, 0.75].map((y, i) => (
            <View key={`h${i}`} style={[styles.mapLineH, { top: `${y * 100}%` }]} />
          ))}
          <View style={styles.parkBlob1} />
          <View style={styles.parkBlob2} />
          <View style={styles.roadH1} />
          <View style={styles.roadH2} />
          <View style={styles.roadV1} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Peta tempat olahraga"
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
      </View>

      {/* Venue Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Card Image Area */}
          <View style={styles.cardImageWrapper}>
            <View style={styles.cardImage}>
              <Text style={styles.cardImageEmoji}>🏸</Text>
            </View>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{venue?.sport ?? "-"}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>⭐ {venue?.rating ?? "-"}</Text>
            </View>
          </View>

          {/* Card Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.venueName}>{venue?.name ?? "-"}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={13} color="#6B7280" />
              <Text style={styles.addressText}>{venue?.address ?? "-"}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.distanceRow}>
                <Ionicons name="location-sharp" size={13} color="#6B7280" />
                <Text style={styles.distanceText}>{venue?.distance ?? "-"}</Text>
              </View>
              <View style={[styles.statusBadge, venue?.status === "Buka" ? styles.statusOpen : styles.statusClosed]}>
                <Text style={[styles.statusText, venue?.status === "Buka" ? styles.statusOpenText : styles.statusClosedText]}>
                  {venue?.status ?? "-"}
                </Text>
              </View>
              <Text style={styles.priceText}>{venue?.price ?? "-"}</Text>
            </View>

            <TouchableOpacity style={styles.detailButton} onPress={handleLihatDetail} activeOpacity={0.85}>
              <Text style={styles.detailButtonText}>Lihat detail</Text>
            </TouchableOpacity>
          </View>
        </View>

        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF4EE" },
  mapBackground: { flex: 1, backgroundColor: "#E8F0E8", position: "relative", overflow: "hidden" },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  mapLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#D1DDD1" },
  mapLineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "#D1DDD1" },
  parkBlob1: { position: "absolute", top: "15%", left: "30%", width: 140, height: 100, borderRadius: 50, backgroundColor: "#C5D9C0", transform: [{ rotate: "-15deg" }] },
  parkBlob2: { position: "absolute", top: "35%", left: "10%", width: 80, height: 60, borderRadius: 30, backgroundColor: "#C5D9C0" },
  roadH1: { position: "absolute", top: "45%", left: 0, right: 0, height: 8, backgroundColor: "#FFFFFF" },
  roadH2: { position: "absolute", top: "25%", left: "20%", right: 0, height: 5, backgroundColor: "#FFFFFF" },
  roadV1: { position: "absolute", left: "55%", top: 0, bottom: 0, width: 8, backgroundColor: "#FFFFFF" },
  searchContainer: { position: "absolute", top: 16, left: 16, right: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 28, paddingHorizontal: 16, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1A1A2E" },
  cardContainer: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  card: { marginHorizontal: 16, marginTop: 8, marginBottom: 16, borderRadius: 20, overflow: "hidden", backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#F3F4F6" },
  cardImageWrapper: { height: 150, position: "relative" },
  cardImage: { flex: 1, backgroundColor: "#1A1A2E", alignItems: "center", justifyContent: "center" },
  cardImageEmoji: { fontSize: 52 },
  sportBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  sportBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  ratingBadge: { position: "absolute", top: 12, right: 12, backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  ratingBadgeText: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },
  cardInfo: { padding: 16 },
  venueName: { fontSize: 18, fontWeight: "700", color: "#1A1A2E", marginBottom: 5 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  addressText: { fontSize: 12, color: "#6B7280", flex: 1 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  distanceText: { fontSize: 12, color: "#6B7280" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusOpen: { backgroundColor: "#DCFCE7" },
  statusClosed: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusOpenText: { color: "#16A34A" },
  statusClosedText: { color: "#DC2626" },
  priceText: { fontSize: 13, fontWeight: "700", color: "#2196F3", marginLeft: "auto" },
  detailButton: { backgroundColor: "#00BFA5", borderRadius: 14, height: 48, alignItems: "center", justifyContent: "center" },
  detailButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  bottomNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: "#F3F4F6", backgroundColor: "#FFFFFF" },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4 },
  navItemActive: { flex: 1, alignItems: "center", justifyContent: "center" },
  navActiveBackground: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#00BFA5", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  navActiveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});