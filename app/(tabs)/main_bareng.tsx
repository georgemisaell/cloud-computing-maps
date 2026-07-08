import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#2563EB";

const categories = ["Semua", "Badminton", "Futsal", "Padel", "Basket"];

// Data dummy — nanti diganti fetch dari backend (lihat updateBackend1.md)
export const dummyAjakan = [
  {
    id: "1",
    hostName: "Andi R.",
    hostInitials: "AR",
    hostColor: "#DBEAFE",
    hostTextColor: "#2563EB",
    timeAgo: "2 jam lalu",
    sport: "Badminton",
    venue: "GOR Arcadia Surabaya",
    address: "Jl. Mayjend Sungkono No.12, Surabaya",
    date: "Sabtu, 28 Jun",
    dateFull: "Sabtu, 28 Jun 2025",
    time: "08:00–10:00 WIB",
    joined: 3,
    quota: 4,
    level: "Santai",
    participants: [
      { name: "Andi R.", initials: "AR", color: "#DBEAFE", textColor: "#2563EB", host: true },
      { name: "Budi S.", initials: "BS", color: "#D1FAE5", textColor: "#059669", host: false },
      { name: "Rini N.", initials: "RN", color: "#FCE7F3", textColor: "#DB2777", host: false },
    ],
  },
  {
    id: "2",
    hostName: "Dika K.",
    hostInitials: "DK",
    hostColor: "#D1FAE5",
    hostTextColor: "#059669",
    timeAgo: "5 jam lalu",
    sport: "Futsal",
    venue: "Lapangan Futsal Kenjeran",
    address: "Jl. Kenjeran No.88, Surabaya",
    date: "Minggu, 29 Jun",
    dateFull: "Minggu, 29 Jun 2025",
    time: "19:00–21:00 WIB",
    joined: 7,
    quota: 10,
    level: "Kompetitif",
    participants: [
      { name: "Dika K.", initials: "DK", color: "#D1FAE5", textColor: "#059669", host: true },
      { name: "Fajar P.", initials: "FP", color: "#DBEAFE", textColor: "#2563EB", host: false },
      { name: "Guntur W.", initials: "GW", color: "#FEF3C7", textColor: "#D97706", host: false },
    ],
  },
];

const sportColors: Record<string, { bg: string; text: string }> = {
  Badminton: { bg: "#EFF6FF", text: "#2563EB" },
  Futsal: { bg: "#FFF7ED", text: "#EA580C" },
  Padel: { bg: "#F5F3FF", text: "#7C3AED" },
  Basket: { bg: "#FEF2F2", text: "#DC2626" },
  Renang: { bg: "#ECFEFF", text: "#0891B2" },
};

export default function MainBarengScreen() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState("Semua");

  const filtered = dummyAjakan.filter(
    (a) => selectedCat === "Semua" || a.sport === selectedCat
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Main Bareng</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.buatBtn}
            onPress={() => router.push("/buat_ajakan")}
          >
            <Ionicons name="add" size={16} color={BLUE} />
            <Text style={styles.buatBtnText}>Buat</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
          </View>
        </View>
      </View>

      {/* Category chips */}
      <View style={styles.chipRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const sc = sportColors[item.sport] ?? sportColors.Badminton;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => router.push({ pathname: "/detail_ajakan", params: { id: item.id } })}
            >
              {/* top row */}
              <View style={styles.cardTop}>
                <View style={styles.hostRow}>
                  <View style={[styles.hostAvatar, { backgroundColor: item.hostColor }]}>
                    <Text style={[styles.hostAvatarText, { color: item.hostTextColor }]}>
                      {item.hostInitials}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.hostName}>{item.hostName}</Text>
                    <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                  </View>
                </View>
                <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.sportBadgeText, { color: sc.text }]}>{item.sport}</Text>
                </View>
              </View>

              {/* venue */}
              <Text style={styles.venue}>{item.venue}</Text>

              {/* meta */}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>📅 {item.date}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{item.time}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="people" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {item.joined}/{item.quota} orang
                </Text>
              </View>

              {/* bottom */}
              <View style={styles.cardBottom}>
                <View style={styles.levelChip}>
                  <Text style={styles.levelChipText}>{item.level}</Text>
                </View>
                <TouchableOpacity
                  style={styles.gabungBtn}
                  onPress={() => router.push({ pathname: "/detail_ajakan", params: { id: item.id } })}
                >
                  <Text style={styles.gabungBtnText}>Gabung</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={BLUE} />
            <Text style={styles.emptyText}>Belum ada ajakan untuk kategori ini</Text>
          </View>
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  buatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buatBtnText: { color: BLUE, fontWeight: "700", fontSize: 14 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: BLUE, fontWeight: "800", fontSize: 14 },

  chipRowWrap: { paddingVertical: 8 },
  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: "#DBEAFE" },
  chipText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  chipTextActive: { color: BLUE },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hostAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  hostAvatarText: { fontWeight: "800", fontSize: 13 },
  hostName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  timeAgo: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  sportBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  sportBadgeText: { fontSize: 12, fontWeight: "700" },

  venue: { fontSize: 18, fontWeight: "800", color: "#111827", marginTop: 14, marginBottom: 8 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { fontSize: 13, color: "#6B7280" },
  metaDot: { fontSize: 13, color: "#D1D5DB" },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  levelChip: { backgroundColor: "#F3F4F6", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  levelChipText: { fontSize: 13, color: "#374151", fontWeight: "600" },
  gabungBtn: { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 28, paddingVertical: 10 },
  gabungBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  empty: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 14, color: "#6B7280" },
});
