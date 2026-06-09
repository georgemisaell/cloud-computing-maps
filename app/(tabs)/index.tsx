import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Venue {
  id: string;
  category: string;
  name: string;
  distance: string;
  status: string;
  price: string;
  rating: number;
  image: { uri: string };
  price_raw: number;
  distance_raw: number;
  lat: number;
  lng: number;
}

// Simple Haversine for distance calculation (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Index() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "kategori" | "jarak" | "harga" | "rating" | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedJarak, setSelectedJarak] = useState<
    "none" | "terdekat" | "terjauh"
  >("none");
  const [selectedHarga, setSelectedHarga] = useState<
    "semua" | "termurah" | "termahal"
  >("semua");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [categories, setCategories] = useState(["Semua"]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Request Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi membutuhkan izin lokasi untuk menghitung jarak ke tempat olahraga.",
        );
        // Fallback to Surabaya center if permission denied
        setUserLocation({ lat: -7.2575, lng: 112.7521 });
      } else {
        // 2. Get Current Position
        try {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        } catch (error) {
          console.error("Error getting location:", error);
          setUserLocation({ lat: -7.2575, lng: 112.7521 });
        }
      }
    })();
  }, []);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("name")
        .order("sort_order", { ascending: true });

      if (catData) {
        setCategories(["Semua", ...catData.map((c) => c.name)]);
      }

      // Fetch Places from the view with ratings and include coordinates
      const { data: placesData, error } = await supabase
        .from("places_with_ratings")
        .select(
          `
          id,
          name,
          lat,
          lng,
          price_min,
          price_max,
          avg_rating,
          categories(name),
          place_images(image_url),
          operating_hours(day_of_week, open_time, close_time, is_closed)
        `,
        )
        .eq("place_images.is_primary", true);

      if (error) throw error;

      if (placesData && userLocation) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 100 + now.getMinutes();

        const formattedVenues: Venue[] = placesData.map((item: any) => {
          // Determine status
          const todayHours = item.operating_hours?.find(
            (h: any) => h.day_of_week === currentDay,
          );
          let status = "Tutup";
          if (todayHours && !todayHours.is_closed) {
            const open = todayHours.open_time
              ? parseInt(todayHours.open_time.replace(/:/g, ""))
              : 0;
            const close = todayHours.close_time
              ? parseInt(todayHours.close_time.replace(/:/g, ""))
              : 0;
            if (currentTime >= open && currentTime <= close) {
              status = "Buka";
            }
          }

          const dist = getDistance(
            userLocation.lat,
            userLocation.lng,
            item.lat,
            item.lng,
          );

          return {
            id: item.id,
            name: item.name,
            category: item.categories?.name || "Uncategorized",
            image: {
              uri:
                item.place_images?.[0]?.image_url ||
                "https://via.placeholder.com/500",
            },
            price: `Rp ${item.price_min / 1000}K–${item.price_max / 1000}K/jam`,
            price_raw: item.price_min,
            rating: item.avg_rating || 0,
            distance: `${dist.toFixed(1)} km`,
            distance_raw: dist,
            status: status,
            lat: item.lat,
            lng: item.lng,
          };
        });
        setVenues(formattedVenues);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchData();
    }
  }, [userLocation, fetchData]);

  const filteredVenues = venues
    .filter((item) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const ratingMatch =
        selectedRating === null || item.rating >= selectedRating;
      const categoryMatch =
        selectedCategory === "Semua" || item.category === selectedCategory;
      return searchMatch && ratingMatch && categoryMatch;
    })
    .sort((a, b) => {
      if (selectedJarak === "terdekat") return a.distance_raw - b.distance_raw;
      if (selectedJarak === "terjauh") return b.distance_raw - a.distance_raw;
      if (selectedHarga === "termurah") return a.price_raw - b.price_raw;
      if (selectedHarga === "termahal") return b.price_raw - a.price_raw;
      return 0;
    });

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.round(rating) ? "star" : "star-outline"}
        size={11}
        color={i < Math.round(rating) ? "#F59E0B" : "rgba(255,255,255,0.4)"}
      />
    ));

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={BLUE} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/*statis */}
      <View style={styles.staticContent}>
        {/* Header baru */}
        <View style={styles.header}>
          <Text style={styles.headline}>
            Temukan tempat olahraga {"\n"} favoritmu 🏆
          </Text>

          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={styles.avatarCircle}
          />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama tempat..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              (activeFilter === "kategori" || selectedCategory !== "Semua") &&
                styles.filterChipActive,
            ]}
            onPress={() =>
              setActiveFilter(activeFilter === "kategori" ? null : "kategori")
            }
          >
            <Text
              style={[
                styles.filterChipText,
                (activeFilter === "kategori" || selectedCategory !== "Semua") &&
                  styles.filterChipTextActive,
              ]}
            >
              {selectedCategory} {activeFilter === "kategori" ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {(["jarak", "harga", "rating"] as const).map((f) => {
            const isOpen = activeFilter === f;
            const isApplied =
              (f === "jarak" && selectedJarak !== "none") ||
              (f === "harga" && selectedHarga !== "semua") ||
              (f === "rating" && selectedRating !== null);
            const label =
              f === "jarak"
                ? selectedJarak === "terdekat"
                  ? "Dekat"
                  : selectedJarak === "terjauh"
                    ? "Jauh"
                    : "Jarak"
                : f === "harga"
                  ? selectedHarga === "termurah"
                    ? "Murah"
                    : selectedHarga === "termahal"
                      ? "Mahal"
                      : "Harga"
                  : "Rating";
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  (isOpen || isApplied) && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(isOpen ? null : f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    (isOpen || isApplied) && styles.filterChipTextActive,
                  ]}
                >
                  {label} {isOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dropdown Kategori */}
        {activeFilter === "kategori" && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Pilih Kategori</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownItem,
                  selectedCategory === cat && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setActiveFilter(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCategory === cat && styles.dropdownItemTextActive,
                  ]}
                >
                  {cat}
                </Text>
                {selectedCategory === cat && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dropdown Jarak */}
        {activeFilter === "jarak" && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Urutkan Jarak</Text>
            {(
              [
                { value: "none", label: "Tanpa urutan jarak" },
                { value: "terdekat", label: "Terdekat dulu" },
                { value: "terjauh", label: "Terjauh dulu" },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.dropdownItem,
                  selectedJarak === opt.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedJarak(opt.value);
                  setActiveFilter(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedJarak === opt.value &&
                      styles.dropdownItemTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {selectedJarak === opt.value && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dropdown Harga */}
        {activeFilter === "harga" && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Urutkan Harga</Text>
            {(
              [
                { value: "semua", label: "Semua harga" },
                { value: "termurah", label: "Termurah dulu" },
                { value: "termahal", label: "Termahal dulu" },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.dropdownItem,
                  selectedHarga === opt.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedHarga(opt.value);
                  setActiveFilter(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedHarga === opt.value &&
                      styles.dropdownItemTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {selectedHarga === opt.value && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dropdown Rating */}
        {activeFilter === "rating" && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Filter Rating</Text>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                selectedRating === null && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setSelectedRating(null);
                setActiveFilter(null);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedRating === null && styles.dropdownItemTextActive,
                ]}
              >
                Semua rating
              </Text>
              {selectedRating === null && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.dropdownItem,
                  selectedRating === n && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedRating(n);
                  setActiveFilter(null);
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Ionicons
                      key={i}
                      name={i < n ? "star" : "star-outline"}
                      size={16}
                      color={i < n ? "#F59E0B" : "#D1D5DB"}
                    />
                  ))}
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { marginLeft: 4 },
                      selectedRating === n && styles.dropdownItemTextActive,
                    ]}
                  >
                    {n === 5 ? "saja" : "ke atas"}
                  </Text>
                </View>
                {selectedRating === n && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Success banner */}
        {(() => {
          const parts: string[] = [];
          if (selectedCategory !== "Semua")
            parts.push(`Kategori: ${selectedCategory}`);
          if (selectedJarak === "terdekat") parts.push("Diurutkan: terdekat");
          if (selectedJarak === "terjauh") parts.push("Diurutkan: terjauh");
          if (selectedHarga === "termurah") parts.push("Harga: termurah dulu");
          if (selectedHarga === "termahal") parts.push("Harga: termahal dulu");
          if (selectedRating !== null)
            parts.push(`Rating ${selectedRating}★ ke atas`);
          if (parts.length === 0) return null;
          return (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark" size={14} color="#0EA5E9" />
              <Text style={styles.successBannerText}>{parts.join(" • ")}</Text>
            </View>
          );
        })()}

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rekomendasi Terdekat</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Lihat semua</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setActiveFilter(null)}
      >
        {filteredVenues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tidak ada hasil</Text>
            <Text style={styles.emptySubtitle}>
              Coba ubah filter atau kata kunci pencarian
            </Text>
          </View>
        ) : (
          filteredVenues.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              // ✅ Fix - kirim data venue yang diklik
              onPress={() =>
                router.push({
                  pathname: "/detail_tempat",
                  params: { venue: JSON.stringify(item) },
                })
              }
            >
              {/* Background foto */}
              <Image
                source={item.image}
                style={styles.cardBg}
                resizeMode="cover"
              />

              {/* Overlay gelap di bawah */}
              <View style={styles.cardOverlay} />

              {/* Badge kategori pojok kiri atas */}
              <View style={styles.cardBadgeWrap}>
                <Text style={styles.cardBadge}>{item.category}</Text>
              </View>

              {/* Status pojok kanan atas */}
              <View
                style={[
                  styles.cardStatusWrap,
                  {
                    backgroundColor:
                      item.status === "Buka" ? "#D1FAE5" : "#FEE2E2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardStatusText,
                    { color: item.status === "Buka" ? "#065F46" : "#991B1B" },
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              {/* Konten bawah */}
              <View style={styles.cardBottom}>
                <View style={styles.cardBottomLeft}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <View style={styles.cardMeta}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text style={styles.cardDistance}>{item.distance}</Text>
                    <View style={styles.starRow}>
                      {renderStars(item.rating)}
                    </View>
                  </View>
                </View>
                <View style={styles.cardPriceWrap}>
                  <Text style={styles.cardPrice}>
                    {item.price.replace("/jam", "")}
                  </Text>
                  <Text style={styles.cardPriceSub}>/jam</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const BLUE = "#0EA5E9";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  staticContent: { paddingHorizontal: 20, paddingTop: 0 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  greeting: { fontSize: 12, color: "#9CA3AF" },
  userName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  // Headline
  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 30,
    marginBottom: 16,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  // Filter chips
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
  },
  filterChipText: { fontSize: 12, color: "#374151" },
  filterChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },

  // Dropdown
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  dropdownTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  dropdownItemActive: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 15, color: "#374151" },
  dropdownItemTextActive: { color: BLUE, fontWeight: "600" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
  },

  // Banner
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  successBannerText: { fontSize: 13, color: BLUE, fontWeight: "600" },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionLink: { fontSize: 13, color: BLUE, fontWeight: "600" },

  // Card
  card: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 4,
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cardBadgeWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardBadge: { fontSize: 11, fontWeight: "700", color: "#fff" },
  cardStatusWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardStatusText: { fontSize: 11, fontWeight: "700" },
  cardBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBottomLeft: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: "800", color: "#fff" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardDistance: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  starRow: { flexDirection: "row", gap: 2 },
  cardPriceWrap: { alignItems: "flex-end" },
  cardPrice: { fontSize: 14, fontWeight: "800", color: "#fff" },
  cardPriceSub: { fontSize: 11, color: "rgba(255,255,255,0.7)" },

  // Empty
  emptyContainer: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  emptySubtitle: { fontSize: 13, color: "#6B7280", textAlign: "center" },
});
