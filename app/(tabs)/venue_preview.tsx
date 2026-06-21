import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

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
  lat?: number;
  lng?: number;
  initial?: string;
  color?: string;
  image?: string;
};

const customMapStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

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
        {venue?.lat && venue?.lng ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_DEFAULT}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            customMapStyle={customMapStyle}
            region={{
              latitude: venue.lat,
              longitude: venue.lng,
              latitudeDelta: 0.0005,
              longitudeDelta: 0.0005,
            }}
          >
            <Marker coordinate={{ latitude: venue.lat, longitude: venue.lng }}>
              <View style={[styles.venueMarker, { backgroundColor: venue.color || "#00BFA5" }]}>
                <Text style={styles.venueMarkerText}>{venue.initial || venue.name?.charAt(0) || "-"}</Text>
              </View>
            </Marker>
          </MapView>
        ) : null}

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
            {venue?.image ? (
              <Image source={{ uri: venue.image }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.cardImage}>
                <Text style={styles.cardImageEmoji}>🏸</Text>
              </View>
            )}
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
  venueMarker: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4, borderWidth: 2, borderColor: "#FFFFFF" },
  venueMarkerText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
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