import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import LoginPrompt from "@/components/LoginPrompt";
import * as Location from "expo-location";
const BLUE = "#0EA5E9";

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

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"kategori" | "rating" | null>(null);

  const categories = ["Semua", "Padel", "Badminton", "Basket"];

  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation({ lat: -7.2575, lng: 112.7521 });
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
        } catch {
          setUserLocation({ lat: -7.2575, lng: 112.7521 });
        }
      }
    })();
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          place_id,
          places (
            id,
            name,
            lat,
            lng,
            price_min,
            price_max,
            categories(name),
            place_images(image_url, is_primary),
            operating_hours(day_of_week, open_time, close_time, is_closed),
            reviews(rating)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 100 + now.getMinutes();

        const formatted = data.map((fav: any) => {
          const place = fav.places;
          if (!place) return null;

          const category = Array.isArray(place.categories) ? place.categories[0]?.name : (place.categories?.name || "Uncategorized");
          
          let status = "Tutup";
          const todayHours = place.operating_hours?.find((h: any) => h.day_of_week === currentDay);
          if (todayHours && !todayHours.is_closed) {
            const open = todayHours.open_time ? parseInt(todayHours.open_time.replace(/:/g, "")) : 0;
            const close = todayHours.close_time ? parseInt(todayHours.close_time.replace(/:/g, "")) : 0;
            if (currentTime >= open && currentTime <= close) status = "Buka";
          }

          let distanceStr = "-";
          if (userLocation && place.lat && place.lng) {
            distanceStr = getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng).toFixed(1) + " km";
          }

          const reviews = place.reviews || [];
          const avgRating = reviews.length > 0
            ? Math.round(reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length)
            : 0;

          const primaryImg = place.place_images?.find((img: any) => img.is_primary)?.image_url 
            || place.place_images?.[0]?.image_url
            || "https://via.placeholder.com/150";

          const priceStr = (place.price_min && place.price_max)
            ? `Rp ${(place.price_min/1000)}K–${(place.price_max/1000)}K`
            : "Gratis";

          return {
            id: place.id,
            fav_id: fav.id, // we might need this for deletion
            name: place.name,
            type: category,
            distance: distanceStr,
            status: status,
            price: priceStr,
            rating: avgRating,
            image: { uri: primaryImg }
          };
        }).filter(Boolean);

        setFavorites(formatted);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (isActive) {
          setSession(data.session);
          setLoadingSession(false);
          if (data.session) {
            fetchFavorites();
          } else {
            setFavorites([]);
          }
        }
      };
      checkSession();
      return () => {
        isActive = false;
      };
    }, [fetchFavorites])
  );

  const handleDelete = async (placeId: string) => {
    try {
      setFavorites((prev) => prev.filter((item) => item.id !== placeId));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);
    } catch (err) {
      console.error("Failed to delete favorite:", err);
      fetchFavorites(); // reload on error
    }
  };

  const filteredFavorites = favorites.filter((item) => {
    const categoryMatch = selectedCategory === "Semua" || item.type === selectedCategory;
    const ratingMatch = selectedRating === null || item.rating >= selectedRating;
    return categoryMatch && ratingMatch;
  });

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={11} color={i < rating ? "#F59E0B" : "rgba(255,255,255,0.4)"} />
    ));

  if (loadingSession || (session && loading && !favorites.length)) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!session) {
    return <LoginPrompt message="Silakan login untuk melihat daftar tempat favorit Anda." />;
  }

  return (
    <View style={styles.container}>

      {/* Header banner */}
      <View style={styles.headerBanner}>
        <View>
          <Text style={styles.headerSub}>Koleksi kamu</Text>
          <Text style={styles.headerTitle}>Tempat Tersimpan</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.headerBadgeText}>{favorites.length}</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, (activeFilter === "kategori" || selectedCategory !== "Semua") && styles.filterChipActive]}
          onPress={() => setActiveFilter(activeFilter === "kategori" ? null : "kategori")}
        >
          <Ionicons name="grid-outline" size={13} color={(activeFilter === "kategori" || selectedCategory !== "Semua") ? "#fff" : "#374151"} />
          <Text style={[styles.filterChipText, (activeFilter === "kategori" || selectedCategory !== "Semua") && styles.filterChipTextActive]}>
            {selectedCategory} {activeFilter === "kategori" ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, (activeFilter === "rating" || selectedRating !== null) && styles.filterChipActive]}
          onPress={() => setActiveFilter(activeFilter === "rating" ? null : "rating")}
        >
          <Ionicons name="star-outline" size={13} color={(activeFilter === "rating" || selectedRating !== null) ? "#fff" : "#374151"} />
          <Text style={[styles.filterChipText, (activeFilter === "rating" || selectedRating !== null) && styles.filterChipTextActive]}>
            Rating {activeFilter === "rating" ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {(selectedCategory !== "Semua" || selectedRating !== null) && (
          <TouchableOpacity
            style={styles.resetChip}
            onPress={() => { setSelectedCategory("Semua"); setSelectedRating(null); }}
          >
            <Ionicons name="close" size={13} color="#6B7280" />
            <Text style={styles.resetChipText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Kategori */}
      {activeFilter === "kategori" && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>Pilih Kategori</Text>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.dropdownItem, selectedCategory === cat && styles.dropdownItemActive]}
              onPress={() => { setSelectedCategory(cat); setActiveFilter(null); }}
            >
              <Text style={[styles.dropdownItemText, selectedCategory === cat && styles.dropdownItemTextActive]}>{cat}</Text>
              {selectedCategory === cat && <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Dropdown Rating */}
      {activeFilter === "rating" && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>Filter Rating</Text>
          <TouchableOpacity
            style={[styles.dropdownItem, selectedRating === null && styles.dropdownItemActive]}
            onPress={() => { setSelectedRating(null); setActiveFilter(null); }}
          >
            <Text style={[styles.dropdownItemText, selectedRating === null && styles.dropdownItemTextActive]}>Semua rating</Text>
            {selectedRating === null && <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
          </TouchableOpacity>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.dropdownItem, selectedRating === n && styles.dropdownItemActive]}
              onPress={() => { setSelectedRating(n); setActiveFilter(null); }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons key={i} name={i < n ? "star" : "star-outline"} size={16} color={i < n ? "#F59E0B" : "#D1D5DB"} />
                ))}
                <Text style={[styles.dropdownItemText, { marginLeft: 4 }, selectedRating === n && styles.dropdownItemTextActive]}>
                  {n === 5 ? "saja" : "ke atas"}
                </Text>
              </View>
              {selectedRating === n && <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Success banner */}
      {(selectedCategory !== "Semua" || selectedRating !== null) && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark" size={14} color={BLUE} />
          <Text style={styles.successBannerText}>
            {selectedCategory !== "Semua" && selectedRating !== null
              ? `${selectedCategory} • Rating ${selectedRating}★ ke atas`
              : selectedCategory !== "Semua"
              ? `Kategori: ${selectedCategory}`
              : `Rating ${selectedRating}★ ke atas`}
          </Text>
        </View>
      )}

      {/* Jumlah favorit */}
      {filteredFavorites.length > 0 && (
        <View style={styles.countRow}>
          <Ionicons name="heart" size={16} color={BLUE} />
          <Text style={styles.countText}>{filteredFavorites.length} tempat tersimpan</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={() => setActiveFilter(null)}
        renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: "/detail_tempat", params: { id: item.id } })}
      >
            <Image source={item.image} style={styles.cardBg} resizeMode="cover" />
            <View style={styles.cardOverlay} />

            <View style={styles.cardBadgeWrap}>
              <Text style={styles.cardBadge}>{item.type}</Text>
            </View>

            <View style={[styles.cardStatusWrap, { backgroundColor: item.status === "Buka" ? "#D1FAE5" : "#FEE2E2" }]}>
              <Text style={[styles.cardStatusText, { color: item.status === "Buka" ? "#065F46" : "#991B1B" }]}>{item.status}</Text>
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

            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Ionicons name="heart" size={18} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="heart-outline" size={48} color={BLUE} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada favorit</Text>
            <Text style={styles.emptySubtitle}>Tap ikon hati di halaman detail untuk menyimpan tempat</Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Ionicons name="search-outline" size={16} color="#fff" />
              <Text style={styles.exploreButtonText}>Jelajahi tempat</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={filteredFavorites.length > 0 ? (
          <View style={styles.footerRow}>
            <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
            <Text style={styles.hint}>Tap card untuk lihat detail tempat</Text>
          </View>
        ) : null}
        contentContainerStyle={filteredFavorites.length === 0 ? styles.emptyFlex : styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 60, paddingHorizontal: 16 },

  headerBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3 },
  headerSub: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: BLUE, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  headerBadgeText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 14, color: "#374151" },
  filterChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
  resetChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F3F4F6", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  resetChipText: { fontSize: 13, color: "#6B7280" },

  dropdown: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
  dropdownTitle: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginBottom: 10, letterSpacing: 0.5 },
  dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 2 },
  dropdownItemActive: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 15, color: "#374151" },
  dropdownItemTextActive: { color: BLUE, fontWeight: "600" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: BLUE, justifyContent: "center", alignItems: "center" },

  successBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  successBannerText: { fontSize: 13, color: BLUE, fontWeight: "600" },

  countRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  countText: { color: "#374151", fontSize: 14 },

  listContent: { paddingBottom: 24 },
  emptyFlex: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", gap: 12, paddingTop: 40 },
  emptyIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  emptySubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", paddingHorizontal: 24 },
  exploreButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BLUE, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  exploreButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  card: { width: "100%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 14, elevation: 4 },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  cardBadgeWrap: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardBadge: { fontSize: 11, fontWeight: "700", color: "#fff" },
cardStatusWrap: { position: "absolute", top: 44, left: 12, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
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
  deleteBtn: { position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center" },
  deleteBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 },
  hint: { textAlign: "center", color: "#9CA3AF", fontSize: 13 },
});