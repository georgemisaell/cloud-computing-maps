import { Ionicons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const dummyFavorites = [
  { id: "1", name: "Padel Surabaya Barat", type: "Padel", distance: "0.8 km", status: "Buka", price: "Rp 60K–80K/jam", rating: 5 },
  { id: "2", name: "GOR Arcadia", type: "Badminton", distance: "1.2 km", status: "Buka", price: "Rp 25K–40K/jam", rating: 4 },
  { id: "3", name: "Basket Kenjeran", type: "Basket", distance: "2.5 km", status: "Tutup", price: "Gratis", rating: 4 },
];

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState(dummyFavorites);
  const handleDelete = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedRating, setSelectedRating] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const categories = ["Semua", "Padel", "Badminton", "Basket"];

  const filteredFavorites = favorites.filter((item) => {
    const categoryMatch = selectedCategory === "Semua" || item.type === selectedCategory;
    const ratingMatch = selectedRating === 0 || item.rating >= selectedRating;
    return categoryMatch && ratingMatch;
  });
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={14} color={i < rating ? "#F59E0B" : "#D1D5DB"} />
    ));
 return (
    <View style={styles.container}>
      <Text style={styles.title}>Tempat favorit</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterActive} onPress={() => setShowCategoryModal(true)}>
          <Text style={styles.filterActiveText}>{selectedCategory} ▾</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={selectedRating > 0 ? styles.filterActive : styles.filterInactive}
          onPress={() => setShowRatingModal(true)}
        >
          <Text style={selectedRating > 0 ? styles.filterActiveText : styles.filterInactiveText}>
            {selectedRating > 0 ? `${selectedRating}★ ke atas` : "Rating ▾"}
          </Text>
        </TouchableOpacity>
      </View>

      {favorites.length > 0 && (
        <View style={styles.countRow}>
          <Ionicons name="heart" size={16} color="#3B82F6" />
          <Text style={styles.countText}>{favorites.length} tempat tersimpan</Text>
        </View>
      )}

      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardImage}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.type} • {item.distance}</Text>
              <View style={styles.cardRow}>
                <View style={styles.stars}>{renderStars(item.rating)}</View>
                <View style={[styles.badge, { backgroundColor: item.status === "Buka" ? "#D1FAE5" : "#FEE2E2" }]}>
                  <Text style={[styles.badgeText, { color: item.status === "Buka" ? "#065F46" : "#991B1B" }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardPrice}>{item.price}</Text>
            </View>
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
              <Ionicons name="add" size={18} color="#3B82F6" />
              <Text style={styles.exploreButtonText}>Jelajahi tempat</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={favorites.length > 0 ? <Text style={styles.hint}>Tap card untuk lihat detail tempat</Text> : null}
        contentContainerStyle={favorites.length === 0 ? styles.emptyFlex : styles.listContent}
      />
      --Modal Kategori--
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalItem}
                onPress={() => { setSelectedCategory(cat); setShowCategoryModal(false); }}
              >
                <Text style={[styles.modalItemText, selectedCategory === cat && { color: "#3B82F6", fontWeight: "700" }]}>
                  {cat}
                </Text>
                {selectedCategory === cat && <Ionicons name="checkmark" size={18} color="#3B82F6" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      --Modal Rating--
      <Modal visible={showRatingModal} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={() => setShowRatingModal(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Minimum Rating</Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.modalItem}
              onPress={() => { setSelectedRating(star); setShowRatingModal(false); }}
            >
              <View style={styles.modalStarRow}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons key={i} name={i < star ? "star" : "star-outline"} size={18} color={i < star ? "#F59E0B" : "#D1D5DB"} />
                ))}
                <Text style={styles.modalItemText}> ke atas</Text>
              </View>
              {selectedRating === star && <Ionicons name="checkmark" size={18} color="#3B82F6" />}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // UBAH container (hapus justifyContent & alignItems, ganti backgroundColor)
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  // HAPUS style text yang lama

  // TAMBAH semua style baru di bawah ini
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterActive: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterActiveText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  filterInactive: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  filterInactiveText: { color: "#374151", fontSize: 14 },
  countRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  countText: { color: "#374151", fontSize: 14 },
  listContent: { paddingBottom: 24 },
  emptyFlex: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  emptySubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", paddingHorizontal: 24 },
  exploreButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderColor: "#3B82F6", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  exploreButtonText: { color: "#3B82F6", fontWeight: "600", fontSize: 15 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, alignItems: "center", elevation: 2 },
  cardImage: { width: 72, height: 72, backgroundColor: "#F3F4F6", borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  cardSub: { fontSize: 13, color: "#6B7280" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stars: { flexDirection: "row", gap: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  cardPrice: { fontSize: 13, color: "#374151" },
  deleteBtn: { padding: 8 },
  hint: { textAlign: "center", color: "#9CA3AF", fontSize: 13, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, width: 280, elevation: 8 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", textAlign: "center", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  modalItemText: { fontSize: 14, color: "#374151" },
  modalStarRow: { flexDirection: "row", alignItems: "center", gap: 2 },
});