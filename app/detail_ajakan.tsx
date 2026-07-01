import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { dummyAjakan } from "./(tabs)/main_bareng";

const BLUE = "#2563EB";

export default function DetailAjakanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Data dummy — nanti fetch detail dari backend (lihat updateBackend1.md)
  const ajakan = dummyAjakan.find((a) => a.id === id) ?? dummyAjakan[0];
  const sisa = ajakan.quota - ajakan.joined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail ajakan main</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Venue card */}
        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{ajakan.venue}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "#EFF6FF" }]}>
              <Text style={[styles.badgeText, { color: BLUE }]}>{ajakan.sport}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#F3F4F6" }]}>
              <Text style={[styles.badgeText, { color: "#374151" }]}>{ajakan.level}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              📅 {ajakan.dateFull} • {ajakan.time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#EF4444" />
            <Text style={styles.infoText}>{ajakan.address}</Text>
          </View>
        </View>

        {/* Peserta */}
        <View style={styles.pesertaHeader}>
          <Text style={styles.pesertaTitle}>
            Peserta ({ajakan.joined}/{ajakan.quota})
          </Text>
          <Text style={styles.pesertaSisa}>
            {sisa > 0 ? `Butuh ${sisa} orang lagi` : "Sudah penuh"}
          </Text>
        </View>

        {ajakan.participants.map((p, i) => (
          <View key={i} style={styles.pesertaRow}>
            <View style={[styles.pesertaAvatar, { backgroundColor: p.color }]}>
              <Text style={[styles.pesertaAvatarText, { color: p.textColor }]}>{p.initials}</Text>
            </View>
            <Text style={styles.pesertaName}>{p.name}</Text>
            {p.host && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>Host</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => Alert.alert("Berhasil", "Kamu bergabung ke ajakan ini (dummy).")}
        >
          <Text style={styles.joinBtnText}>Gabung sekarang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.waBtn}
          onPress={() => Alert.alert("Grup WA", "Membuka grup WhatsApp (dummy).")}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#059669" />
          <Text style={styles.waBtnText}>Grup WA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },

  content: { paddingHorizontal: 20, paddingBottom: 24 },

  venueCard: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    backgroundColor: "#fff",
  },
  venueName: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  badge: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  infoText: { fontSize: 13, color: "#4B5563" },

  pesertaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  pesertaTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  pesertaSisa: { fontSize: 13, fontWeight: "600", color: BLUE },

  pesertaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  pesertaAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  pesertaAvatarText: { fontWeight: "800", fontSize: 14 },
  pesertaName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111827" },
  hostBadge: { backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  hostBadgeText: { fontSize: 12, fontWeight: "700", color: "#D97706" },

  bottomBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  joinBtn: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  joinBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  waBtnText: { color: "#059669", fontWeight: "800", fontSize: 15 },
});
