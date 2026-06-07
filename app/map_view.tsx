import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export interface Venue {
  id: string;
  initial: string;
  color: string;
  name: string;
  address: string;
  distance: string;
  price: string;
  status: string;
  rating: number;
  sport: string;
  top: number;
  left: number;
}

const VENUES: Venue[] = [
  {
    id: "1",
    initial: "K",
    color: "#9C27B0",
    name: "GOR Arcadia",
    address: "Jl. Mayjend Sungkono No.12, Surabaya",
    distance: "1.2 km",
    price: "Rp 25K–40K/jam",
    status: "Buka",
    rating: 4.5,
    sport: "Badminton",
    top: 0.22,
    left: 0.18,
  },
  {
    id: "2",
    initial: "P",
    color: "#4CAF50",
    name: "Lapangan Pakuwon",
    address: "Jl. Pakuwon Indah No.5, Surabaya",
    distance: "2.1 km",
    price: "Rp 30K–50K/jam",
    status: "Buka",
    rating: 4.2,
    sport: "Tennis",
    top: 0.28,
    left: 0.65,
  },
  {
    id: "3",
    initial: "B",
    color: "#FF9800",
    name: "Sport Center Bukit",
    address: "Jl. Bukit Darmo No.8, Surabaya",
    distance: "3.0 km",
    price: "Rp 20K–35K/jam",
    status: "Tutup",
    rating: 3.9,
    sport: "Basket",
    top: 0.58,
    left: 0.22,
  },
];

export default function MapViewScreen() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [search, setSearch] = useState("");

  const MAP_HEIGHT = height * 0.72;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fake Map Background */}
      <View style={[styles.map, { height: MAP_HEIGHT }]}>
        {/* Road lines */}
        <View style={styles.roadV1} />
        <View style={styles.roadH1} />
        <View style={styles.roadH2} />
        <View style={styles.roadD1} />
        <View style={styles.roadD2} />

        {/* Green areas (taman) */}
        <View style={styles.park1} />
        <View style={styles.park2} />

        {/* Building blocks */}
        <View style={[styles.block, { top: "15%", left: "5%", width: 60, height: 50 }]} />
        <View style={[styles.block, { top: "60%", left: "55%", width: 70, height: 55 }]} />
        <View style={[styles.block, { top: "70%", left: "5%", width: 55, height: 45 }]} />

        {/* User location dot */}
        <View style={styles.userDotWrapper}>
          <View style={styles.userDotOuter}>
            <View style={styles.userDotInner} />
          </View>
          <View style={styles.userLabel}>
            <Text style={styles.userLabelText}>Lokasi saya</Text>
          </View>
        </View>

        {/* Venue Markers */}
        {VENUES.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[
              styles.venueMarker,
              {
                backgroundColor: venue.color,
                top: MAP_HEIGHT * venue.top,
                left: width * venue.left,
              },
            ]}
            onPress={() => router.push({
  pathname: "/venue_preview",
  params: { venue: JSON.stringify(venue) },
})}
          >
            <Text style={styles.venueMarkerText}>{venue.initial}</Text>
          </TouchableOpacity>
        ))}

        {/* Compass */}
        <TouchableOpacity style={styles.compassButton}>
          <Ionicons name="navigate" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Peta tempat olahraga"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Venue Preview Card */}
      {selectedVenue && (
        <View style={cardStyles.wrapper}>
          {/* Image placeholder */}
          <View style={cardStyles.imagePlaceholder}>
            <View style={cardStyles.badge}>
              <Text style={cardStyles.badgeText}>{selectedVenue.sport}</Text>
            </View>
            <View style={cardStyles.ratingBadge}>
              <Text style={cardStyles.ratingText}>⭐ {selectedVenue.rating}</Text>
            </View>
            <TouchableOpacity
              style={cardStyles.closeBtn}
              onPress={() => setSelectedVenue(null)}
            >
              <Ionicons name="close" size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={cardStyles.info}>
            <Text style={cardStyles.name}>{selectedVenue.name}</Text>
            <Text style={cardStyles.address}>{selectedVenue.address}</Text>
            <View style={cardStyles.row}>
              <View style={cardStyles.rowLeft}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={cardStyles.distance}>{selectedVenue.distance}</Text>
                <View
                  style={[
                    cardStyles.statusBadge,
                    selectedVenue.status === "Buka"
                      ? cardStyles.open
                      : cardStyles.closed,
                  ]}
                >
                  <Text
                    style={[
                      cardStyles.statusText,
                      selectedVenue.status === "Buka"
                        ? cardStyles.openText
                        : cardStyles.closedText,
                    ]}
                  >
                    {selectedVenue.status}
                  </Text>
                </View>
              </View>
              <Text style={cardStyles.price}>{selectedVenue.price}</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={cardStyles.detailButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/venue_preview",
                  params: { venue: JSON.stringify(selectedVenue) },
                })
              }
            >
              <Text style={cardStyles.detailButtonText}>Lihat detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F0F7" },
  map: {
    width: "100%",
    backgroundColor: "#E8F0F7",
    position: "relative",
    overflow: "hidden",
  },
  roadV1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "42%",
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  roadH1: {
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "#FFFFFF",
  },
  roadH2: {
    position: "absolute",
    top: "65%",
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "#FFFFFF",
  },
  roadD1: {
    position: "absolute",
    top: "5%",
    left: "-5%",
    width: "60%",
    height: 16,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "30deg" }],
  },
  roadD2: {
    position: "absolute",
    top: "48%",
    left: "35%",
    width: "80%",
    height: 14,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-15deg" }],
  },
  park1: {
    position: "absolute",
    top: "8%",
    left: "5%",
    width: 100,
    height: 120,
    backgroundColor: "#C8E6C9",
    borderRadius: 12,
  },
  park2: {
    position: "absolute",
    top: "42%",
    right: "5%",
    width: 80,
    height: 90,
    backgroundColor: "#C8E6C9",
    borderRadius: 10,
  },
  block: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    opacity: 0.8,
  },
  userDotWrapper: {
    position: "absolute",
    top: "44%",
    left: "38%",
    alignItems: "center",
  },
  userDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(33,150,243,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  userDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userLabel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userLabelText: { fontSize: 11, fontWeight: "600", color: "#374151" },
  venueMarker: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  venueMarkerText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  compassButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchContainer: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1A1A2E" },
});

const cardStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 90,
    left: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: "#1A1A2E",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 12,
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  ratingBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingText: { fontSize: 12, fontWeight: "700", color: "#1A1A2E" },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: "700", color: "#1A1A2E", marginBottom: 4 },
  address: { fontSize: 13, color: "#6B7280", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  distance: { fontSize: 13, color: "#6B7280", marginLeft: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 4 },
  open: { backgroundColor: "#DCFCE7" },
  closed: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "600" },
  openText: { color: "#16A34A" },
  closedText: { color: "#DC2626" },
  price: { fontSize: 13, fontWeight: "700", color: "#2196F3" },
  detailButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#00BFA5",
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});