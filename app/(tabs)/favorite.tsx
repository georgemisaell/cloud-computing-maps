import { Ionicons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BLUE = "#0EA5E9";
 
const dummyFavorites = [
  { id: "1", name: "Padel Surabaya Barat", type: "Padel", distance: "0.8 km", status: "Buka", price: "Rp 60K–80K/jam", rating: 5, bgColor: "#E8F4F8" },
  { id: "2", name: "GOR Arcadia", type: "Badminton", distance: "1.2 km", status: "Buka", price: "Rp 25K–40K/jam", rating: 4, bgColor: "#1A1A2E" },
  { id: "3", name: "Basket Kenjeran", type: "Basket", distance: "2.5 km", status: "Tutup", price: "Gratis", rating: 4, bgColor: "#2C3E50" },
];
 
export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState(dummyFavorites);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"kategori" | "rating" | null>(null);
 
  const categories = ["Semua", "Padel", "Badminton", "Basket"];
 
  const handleDelete = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };
 
  const filteredFavorites = favorites.filter((item) => {
    const categoryMatch = selectedCategory === "Semua" || item.type === selectedCategory;
    const ratingMatch = selectedRating === null || item.rating >= selectedRating;
    return categoryMatch && ratingMatch;
  });
 
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={12} color={i < rating ? "#F59E0B" : "#D1D5DB"} />
    ));
 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tempat favorit</Text>
 
      {/* Filter chips */}
      <View style={styles.filterRow}>
        {/* Chip Kategori */}
        <TouchableOpacity
          style={[styles.filterChip, (activeFilter === "kategori" || selectedCategory !== "Semua") && styles.filterChipActive]}
          onPress={() => setActiveFilter(activeFilter === "kategori" ? null : "kategori")}
        >
          <Text style={[styles.filterChipText, (activeFilter === "kategori" || selectedCategory !== "Semua") && styles.filterChipTextActive]}>
            {selectedCategory} {activeFilter === "kategori" ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
 
        {/* Chip Rating */}
        <TouchableOpacity
          style={[styles.filterChip, (activeFilter === "rating" || selectedRating !== null) && styles.filterChipActive]}
          onPress={() => setActiveFilter(activeFilter === "rating" ? null : "rating")}
        >
          <Text style={[styles.filterChipText, (activeFilter === "rating" || selectedRating !== null) && styles.filterChipTextActive]}>
            Rating {activeFilter === "rating" ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
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
              <Text style={[styles.dropdownItemText, selectedCategory === cat && styles.dropdownItemTextActive]}>
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
 
      {/* Dropdown Rating */}
      {activeFilter === "rating" && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>Filter Rating</Text>
          <TouchableOpacity
            style={[styles.dropdownItem, selectedRating === null && styles.dropdownItemActive]}
            onPress={() => { setSelectedRating(null); setActiveFilter(null); }}
          >
            <Text style={[styles.dropdownItemText, selectedRating === null && styles.dropdownItemTextActive]}>
              Semua rating
            </Text>
            {selectedRating === null && (
              <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>
            )}
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
              {selectedRating === n && (
                <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>
              )}
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
              ? `Kategori: ${selectedCategory} • Rating ${selectedRating}★ ke atas`
              : selectedCategory !== "Semua"
              ? `Filter: kategori ${selectedCategory}`
              : `Filter: rating ${selectedRating}★ ke atas`}
          </Text>
        </View>
      )}
 
      {/* Count */}
      {filteredFavorites.length > 0 && (
        <View style={styles.countRow}>
          <Ionicons name="heart" size={16} color={BLUE} />
          <Text style={styles.countText}>{filteredFavorites.length} tempat tersimpan</Text>
        </View>
      )}
 
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={() => setActiveFilter(null)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            {/* Thumbnail — persis struktur Home: width 110, height 100, badge putih pojok bawah */}
            <View style={[styles.cardThumb, { backgroundColor: item.bgColor }]}>
              <Text style={styles.categoryBadge}>{item.type}</Text>
            </View>
            {/* Info  */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDistance}>📍 {item.distance}</Text>
              <View style={styles.starsRow}>
                {renderStars(item.rating)}
              </View>
              <View style={styles.cardRow}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === "Buka" ? "#D1FAE5" : "#FEE2E2" }]}>
                  <Text style={[styles.statusText, { color: item.status === "Buka" ? "#065F46" : "#991B1B" }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
            </View>
            {/* Tombol hapus */}
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Belum ada favorit</Text>
            <Text style={styles.emptySubtitle}>Tap ikon hati di halaman detail untuk menyimpan tempat</Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Ionicons name="add" size={18} color={BLUE} />
              <Text style={styles.exploreButtonText}>Jelajahi tempat</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={filteredFavorites.length > 0 ? <Text style={styles.hint}>Tap card untuk lihat detail tempat</Text> : null}
        contentContainerStyle={filteredFavorites.length === 0 ? styles.emptyFlex : styles.listContent}
      />
    </View>
  );
}
 
const BLUE_CONST = "#0EA5E9";
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 56, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 16 },
 
  // Filter chips 
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 14, color: "#374151" },
  filterChipActive: { backgroundColor: BLUE_CONST, borderColor: BLUE_CONST },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
 
  // Dropdown
  dropdown: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
  dropdownTitle: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginBottom: 10, letterSpacing: 0.5 },
  dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 2 },
  dropdownItemActive: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 15, color: "#374151" },
  dropdownItemTextActive: { color: BLUE_CONST, fontWeight: "600" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: BLUE_CONST, justifyContent: "center", alignItems: "center" },
 
  // Success banner 
  successBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  successBannerText: { fontSize: 13, color: BLUE_CONST, fontWeight: "600" },
 
  // Count
  countRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  countText: { color: "#374151", fontSize: 14 },
 
  // List
  listContent: { paddingBottom: 24 },
  emptyFlex: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  emptySubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", paddingHorizontal: 24 },
  exploreButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: BLUE_CONST, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  exploreButtonText: { color: BLUE_CONST, fontWeight: "600", fontSize: 15 },
 
  // Card 
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, overflow: "hidden", marginBottom: 12, elevation: 3 },
  cardThumb: { width: 110, height: 100, justifyContent: "flex-end", padding: 8 },
  categoryBadge: { backgroundColor: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "700", color: "#333", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardName: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  cardDistance: { fontSize: 13, color: "#6B7280", marginVertical: 4 },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardPrice: { fontSize: 13, fontWeight: "700", color: BLUE_CONST },
  deleteBtn: { padding: 8, alignSelf: "center" },
  hint: { textAlign: "center", color: "#9CA3AF", fontSize: 13, marginTop: 8 },
});