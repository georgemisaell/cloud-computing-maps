import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
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

const BLUE = "#0EA5E9";

export default function Index() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);

  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [showJarakModal, setShowJarakModal] = useState(false);
  const [showHargaModal, setShowHargaModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedJarak, setSelectedJarak] = useState<"none" | "terdekat" | "terjauh">("none");
  const [selectedHarga, setSelectedHarga] = useState<"semua" | "termurah" | "termahal">("semua");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [categories, setCategories] = useState(["Semua"]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [profile, setProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);

  const hasFilter =
    selectedCategory !== "Semua" ||
    selectedJarak !== "none" ||
    selectedHarga !== "semua" ||
    selectedRating !== null;

  const resetFilter = () => {
    setSelectedCategory("Semua");
    setSelectedJarak("none");
    setSelectedHarga("semua");
    setSelectedRating(null);
  };

  useFocusEffect(
    useCallback(() => {
      async function fetchUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("name, avatar_url").eq("id", user.id).single();
          if (data) setProfile({ name: data.name, avatar_url: data.avatar_url });
        } else {
          setProfile(null);
        }
      }
      fetchUser();
    }, [])
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Aplikasi membutuhkan izin lokasi untuk menghitung jarak ke tempat olahraga.");
        setUserLocation({ lat: -7.2575, lng: 112.7521 });
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
        } catch (error) {
          console.error("Error getting location:", error);
          setUserLocation({ lat: -7.2575, lng: 112.7521 });
        }
      }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: catData } = await supabase
        .from("categories")
        .select("name")
        .order("sort_order", { ascending: true });

      if (catData) {
        setCategories(["Semua", ...catData.map((c) => c.name)]);
      }

      const { data: placesData, error } = await supabase
        .from("places_with_ratings")
        .select(`
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
        `)
        .eq("place_images.is_primary", true);

      if (error) throw error;

      if (placesData && userLocation) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 100 + now.getMinutes();

        const formattedVenues: Venue[] = placesData.map((item: any) => {
          const todayHours = item.operating_hours?.find((h: any) => h.day_of_week === currentDay);
          let status = "Tutup";
          if (todayHours && !todayHours.is_closed) {
            const open = todayHours.open_time ? parseInt(todayHours.open_time.replace(/:/g, "")) : 0;
            const close = todayHours.close_time ? parseInt(todayHours.close_time.replace(/:/g, "")) : 0;
            if (currentTime >= open && currentTime <= close) status = "Buka";
          }

          const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);

          return {
            id: item.id,
            name: item.name,
            category: item.categories?.name || "Uncategorized",
            image: { uri: item.place_images?.[0]?.image_url || "https://via.placeholder.com/500" },
            price: `Rp ${item.price_min / 1000}K–${item.price_max / 1000}K/jam`,
            price_raw: item.price_min,
            rating: item.avg_rating || 0,
            distance: `${dist.toFixed(1)} km`,
            distance_raw: dist,
            status,
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
    if (userLocation) fetchData();
  }, [userLocation, fetchData]);

  const filteredVenues = venues
    .filter((item) => {
      const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
      const ratingMatch = selectedRating === null || item.rating >= selectedRating;
      const categoryMatch = selectedCategory === "Semua" || item.category === selectedCategory;
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
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.staticContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headline}>
            Temukan tempat olahraga {"\n"} favoritmu 
          </Text>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Image
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name || "User"}&background=random` }}
                style={styles.avatarCircle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Cari nama tempat..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                Keyboard.dismiss();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory !== "Semua" && styles.filterChipActive]}
            onPress={() => setShowKategoriModal(true)}
          >
            <Text numberOfLines={1} ellipsizeMode="tail"
              style={[styles.filterChipText, selectedCategory !== "Semua" && styles.filterChipTextActive]}>
              {selectedCategory} ▼
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedJarak !== "none" && styles.filterChipActive]}
            onPress={() => setShowJarakModal(true)}
          >
            <Text numberOfLines={1} ellipsizeMode="tail"
              style={[styles.filterChipText, selectedJarak !== "none" && styles.filterChipTextActive]}>
              {selectedJarak === "terdekat" ? "Dekat" : selectedJarak === "terjauh" ? "Jauh" : "Jarak"} ▼
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedHarga !== "semua" && styles.filterChipActive]}
            onPress={() => setShowHargaModal(true)}
          >
            <Text numberOfLines={1} ellipsizeMode="tail"
              style={[styles.filterChipText, selectedHarga !== "semua" && styles.filterChipTextActive]}>
              {selectedHarga === "termurah" ? "Murah" : selectedHarga === "termahal" ? "Mahal" : "Harga"} ▼
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedRating !== null && styles.filterChipActive]}
            onPress={() => setShowRatingModal(true)}
          >
            <Text numberOfLines={1} ellipsizeMode="tail"
              style={[styles.filterChipText, selectedRating !== null && styles.filterChipTextActive]}>
              {selectedRating !== null ? `${selectedRating}★` : "Rating"} ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reset chip */}
        {hasFilter && (
          <TouchableOpacity style={styles.resetChip} onPress={resetFilter}>
            <Ionicons name="close-circle" size={14} color="#6B7280" />
            <Text style={styles.resetChipText}>Reset filter</Text>
          </TouchableOpacity>
        )}

        {/* Success banner */}
        {hasFilter && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark" size={14} color={BLUE} />
            <Text style={styles.successBannerText}>
              {[
                selectedCategory !== "Semua" && `Kategori: ${selectedCategory}`,
                selectedJarak === "terdekat" && "Diurutkan: terdekat",
                selectedJarak === "terjauh" && "Diurutkan: terjauh",
                selectedHarga === "termurah" && "Harga: termurah dulu",
                selectedHarga === "termahal" && "Harga: termahal dulu",
                selectedRating !== null && `Rating ${selectedRating}★ ke atas`,
              ]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          </View>
        )}

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rekomendasi Terdekat</Text>
          <View style={styles.venueCount}>
            <Ionicons name="location-outline" size={14} color={BLUE} />
            <Text style={styles.venueCountText}>{filteredVenues.length} tempat ditemukan</Text>
          </View>
        </View>

      </View>

      {/* Scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredVenues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tidak ada hasil</Text>
            <Text style={styles.emptySubtitle}>Coba ubah filter atau kata kunci pencarian</Text>
          </View>
        ) : (
          <>
            {filteredVenues.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push({ pathname: "/detail_tempat", params: { venue: JSON.stringify(item) } })}
              >
                <Image source={item.image} style={styles.cardBg} resizeMode="cover" />
                <View style={styles.cardOverlay} />
                <View style={styles.cardBadgeWrap}>
                  <Text style={styles.cardBadge}>{item.category}</Text>
                </View>
                <View style={[styles.cardStatusWrap, { backgroundColor: item.status === "Buka" ? "#D1FAE5" : "#FEE2E2" }]}>
                  <Text style={[styles.cardStatusText, { color: item.status === "Buka" ? "#065F46" : "#991B1B" }]}>
                    {item.status}
                  </Text>
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.cardBottomLeft}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.cardDistance}>{item.distance}</Text>
                      <View style={styles.starRow}>{renderStars(item.rating)}</View>
                    </View>
                  </View>
                  <View style={styles.cardPriceWrap}>
                    <Text style={styles.cardPrice}>{item.price.replace("/jam", "")}</Text>
                    <Text style={styles.cardPriceSub}>/jam</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Footer */}
            <View style={styles.footerRow}>
              <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
              <Text style={styles.hint}>Tap card untuk lihat detail tempat</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal Kategori */}
      <Modal visible={showKategoriModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowKategoriModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalItem}
                onPress={() => { setSelectedCategory(cat); setShowKategoriModal(false); }}
              >
                <Text style={[styles.modalItemText, selectedCategory === cat && styles.modalItemActive]}>
                  {cat}
                </Text>
                {selectedCategory === cat && <Ionicons name="checkmark" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Jarak */}
      <Modal visible={showJarakModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowJarakModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Urutkan Jarak</Text>
            {([
              { value: "none", label: "Tanpa urutan jarak" },
              { value: "terdekat", label: "Terdekat dulu" },
              { value: "terjauh", label: "Terjauh dulu" },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalItem}
                onPress={() => { setSelectedJarak(opt.value); setShowJarakModal(false); }}
              >
                <Text style={[styles.modalItemText, selectedJarak === opt.value && styles.modalItemActive]}>
                  {opt.label}
                </Text>
                {selectedJarak === opt.value && <Ionicons name="checkmark" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Harga */}
      <Modal visible={showHargaModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowHargaModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Urutkan Harga</Text>
            {([
              { value: "semua", label: "Semua harga" },
              { value: "termurah", label: "Termurah dulu" },
              { value: "termahal", label: "Termahal dulu" },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalItem}
                onPress={() => { setSelectedHarga(opt.value); setShowHargaModal(false); }}
              >
                <Text style={[styles.modalItemText, selectedHarga === opt.value && styles.modalItemActive]}>
                  {opt.label}
                </Text>
                {selectedHarga === opt.value && <Ionicons name="checkmark" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Rating */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowRatingModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Filter Rating</Text>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => { setSelectedRating(null); setShowRatingModal(false); }}
            >
              <Text style={[styles.modalItemText, selectedRating === null && styles.modalItemActive]}>
                Semua rating
              </Text>
              {selectedRating === null && <Ionicons name="checkmark" size={18} color={BLUE} />}
            </TouchableOpacity>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={styles.modalItem}
                onPress={() => { setSelectedRating(n); setShowRatingModal(false); }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Ionicons key={i} name={i < n ? "star" : "star-outline"} size={18}
                      color={i < n ? "#F59E0B" : "#D1D5DB"} />
                  ))}
                  <Text style={[styles.modalItemText, { marginLeft: 4 }, selectedRating === n && styles.modalItemActive]}>
                    {n === 5 ? "saja" : "ke atas"}
                  </Text>
                </View>
                {selectedRating === n && <Ionicons name="checkmark" size={18} color={BLUE} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  staticContent: { paddingHorizontal: 20, paddingTop: 0 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", paddingTop: 16, marginBottom: 16, gap: 12 },
  headline: { flex: 1, fontSize: 20, fontWeight: "800", color: "#111827", lineHeight: 30 },
  avatarWrapper: { justifyContent: "center", alignItems: "center" },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE },

  // Search
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 28, paddingHorizontal: 16, height: 52, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#1A1A2E" },

  // Filter chips
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  filterChip: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 7, alignItems: "center", overflow: "hidden" },
  filterChipText: { fontSize: 12, color: "#374151", flexShrink: 1 },
  filterChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },

  // Reset chip
  resetChip: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: "#F3F4F6", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12 },
  resetChipText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },

  // Banner
  successBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  successBannerText: { fontSize: 13, color: BLUE, fontWeight: "600", flex: 1 },

  // Section
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  venueCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  venueCountText: { fontSize: 13, color: BLUE, fontWeight: "600" },

  // Card
  card: { width: "100%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 14, elevation: 4 },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  cardBadgeWrap: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardBadge: { fontSize: 11, fontWeight: "700", color: "#fff" },
  cardStatusWrap: { position: "absolute", top: 12, right: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardStatusText: { fontSize: 11, fontWeight: "700" },
  cardBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardBottomLeft: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: "800", color: "#fff" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardDistance: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  starRow: { flexDirection: "row", gap: 2 },
  cardPriceWrap: { alignItems: "flex-end" },
  cardPrice: { fontSize: 14, fontWeight: "800", color: "#fff" },
  cardPriceSub: { fontSize: 11, color: "rgba(255,255,255,0.7)" },

  // Footer
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 },
  hint: { textAlign: "center", color: "#9CA3AF", fontSize: 13 },

  // Empty
  emptyContainer: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  emptySubtitle: { fontSize: 13, color: "#6B7280", textAlign: "center" },

  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, width: 280, elevation: 8 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", textAlign: "center", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  modalItemText: { fontSize: 14, color: "#374151" },
  modalItemActive: { color: BLUE, fontWeight: "700" },
});