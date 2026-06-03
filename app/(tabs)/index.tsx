import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useState } from "react";

const VENUES = [
  { id: "1", category: "Padel", name: "Padel Surabaya Barat", distance: "0.8 km", status: "Buka", price: "Rp 60K–80K/jam", bgColor: "#E8F4F8", rating: 5 },
  { id: "2", category: "Badminton", name: "GOR Arcadia", distance: "1.2 km", status: "Buka", price: "Rp 25K–40K/jam", bgColor: "#1A1A2E", rating: 4 },
  { id: "3", category: "Basket", name: "Basket Kenjeran", distance: "2.5 km", status: "Buka", price: "Rp 150K–200K/jam", bgColor: "#2C3E50", rating: 4 },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"jarak" | "harga" | "rating" | null>(null);
  const [selectedJarak, setSelectedJarak] = useState<"none" | "terdekat" | "terjauh">("terdekat");
  const [selectedHarga, setSelectedHarga] = useState<"semua" | "termurah" | "termahal">("semua");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Ionicons
      key={i}
      name={i < rating ? "star" : "star-outline"}
      size={12}
      color={i < rating ? "#F59E0B" : "#D1D5DB"}
    />
  ));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Selamat pagi, Faizatun</Text>
            <TouchableOpacity style={styles.locationRow}>
              <Text style={styles.locationText}>📍 Surabaya ⌄</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>F</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Temukan tempat olahraga</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text>🔍 </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama tempat..."
            placeholderTextColor="#AAA"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(["jarak", "harga", "rating"] as const).map((f) => {
            const label = f === "jarak" ? "Jarak" : f === "harga" ? "Harga" : "Rating";
            const isOpen = activeFilter === f;
            const isApplied =
              (f === "jarak" && selectedJarak !== "none") ||
              (f === "harga" && selectedHarga !== "semua") ||
              (f === "rating" && selectedRating !== null);
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, (isOpen || isApplied) && styles.filterChipActive]}
                onPress={() => setActiveFilter(isOpen ? null : f)}
              >
                <Text style={[styles.filterChipText, (isOpen || isApplied) && styles.filterChipTextActive]}>
                  {label} {isOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dropdown Jarak */}
        {activeFilter === "jarak" && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Urutkan Jarak</Text>
            {([
              { value: "none", label: "Tanpa urutan jarak" },
              { value: "terdekat", label: "Terdekat dulu" },
              { value: "terjauh", label: "Terjauh dulu" },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownItem, selectedJarak === opt.value && styles.dropdownItemActive]}
                onPress={() => { setSelectedJarak(opt.value); setActiveFilter(null); }}
              >
                <Text style={[styles.dropdownItemText, selectedJarak === opt.value && styles.dropdownItemTextActive]}>
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
            {([
              { value: "semua", label: "Semua harga" },
              { value: "termurah", label: "Termurah dulu" },
              { value: "termahal", label: "Termahal dulu" },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownItem, selectedHarga === opt.value && styles.dropdownItemActive]}
                onPress={() => { setSelectedHarga(opt.value); setActiveFilter(null); }}
              >
                <Text style={[styles.dropdownItemText, selectedHarga === opt.value && styles.dropdownItemTextActive]}>
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
        {(selectedJarak !== "none" || selectedHarga !== "semua" || selectedRating !== null) && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark" size={14} color="#0EA5E9" />
            <Text style={styles.successBannerText}>
              {selectedJarak === "terdekat" && "Diurutkan: terdekat dari lokasi kamu"}
              {selectedJarak === "terjauh" && "Diurutkan: terjauh dari lokasi kamu"}
              {selectedHarga === "termurah" && "Diurutkan: harga termurah dulu"}
              {selectedHarga === "termahal" && "Diurutkan: harga termahal dulu"}
              {selectedRating !== null && `Filter: rating ${selectedRating}★ ke atas`}
            </Text>
          </View>
        )}

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rekomendasi Terdekat</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Lihat semua</Text>
          </TouchableOpacity>
        </View>

        {/* Venue Cards */}
        {VENUES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={[styles.cardThumb, { backgroundColor: item.bgColor }]}>
              <Text style={styles.badge}>{item.category}</Text>
            </View>
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
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const BLUE = "#3B82F6";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 16, marginBottom: 4 },
  greeting: { fontSize: 13, color: "#888", marginBottom: 4 },
  locationRow: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  locationText: { fontSize: 13, fontWeight: "600", color: BLUE },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: BLUE, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  headline: { fontSize: 24, fontWeight: "bold", color: "#111827", marginTop: 14, marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fff" },
  filterChipText: { fontSize: 14, color: "#374151" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionLink: { fontSize: 13, color: BLUE, fontWeight: "600" },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, overflow: "hidden", marginBottom: 12, elevation: 3 },
  cardThumb: { width: 110, height: 100, justifyContent: "flex-end", padding: 8 },
  badge: { backgroundColor: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "700", color: "#333", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardName: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  cardDistance: { fontSize: 13, color: "#6B7280", marginVertical: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusOpen: { backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  cardPrice: { fontSize: 13, fontWeight: "700", color: BLUE },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 2, marginBottom: 4 },
  filterChipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
  dropdown: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  dropdownTitle: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginBottom: 10, letterSpacing: 0.5 },
  dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 2 },
  dropdownItemActive: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 15, color: "#374151" },
  dropdownItemTextActive: { color: "#0EA5E9", fontWeight: "600" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#0EA5E9", justifyContent: "center", alignItems: "center" },
  successBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EFF6FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  successBannerText: { fontSize: 13, color: "#0EA5E9", fontWeight: "600" },
});
