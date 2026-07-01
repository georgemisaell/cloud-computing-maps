import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BLUE = "#0EA5E9";

const dummyHistory = [
  { id: "1", name: "Padel Surabaya Barat", type: "Padel", date: "Hari ini, 08.00", distance: "0.8 km", status: "Buka" },
  { id: "2", name: "GOR Arcadia", type: "Badminton", date: "Kemarin, 14.30", distance: "1.2 km", status: "Buka" },
  { id: "3", name: "Basket Kenjeran", type: "Basket", date: "2 hari lalu, 10.00", distance: "2.5 km", status: "Tutup" },
  { id: "4", name: "Padel Surabaya Barat", type: "Padel", date: "3 hari lalu, 09.00", distance: "0.8 km", status: "Buka" },
  { id: "5", name: "GOR Arcadia", type: "Badminton", date: "5 hari lalu, 16.00", distance: "1.2 km", status: "Buka" },
];

const iconMap: Record<string, string> = {
  Padel: "tennisball-outline",
  Badminton: "people-outline",
  Basket: "basketball-outline",
};

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Info */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={BLUE} />
          <Text style={styles.infoText}>Menampilkan 5 lokasi terakhir yang dikunjungi</Text>
        </View>

        {/* List */}
        {dummyHistory.map((item, index) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name={iconMap[item.type] as any} size={22} color={BLUE} />
              </View>
              {index < dummyHistory.length - 1 && <View style={styles.connector} />}
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === "Buka" ? "#D1FAE5" : "#FEE2E2" }]}>
                  <Text style={[styles.statusText, { color: item.status === "Buka" ? "#065F46" : "#991B1B" }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardType}>{item.type}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                <Text style={styles.cardDate}>{item.date}</Text>
                <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                <Text style={styles.cardDistance}>{item.distance}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty space */}
        <View style={{ height: 20 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },

  // Header
  header: { backgroundColor: "#0F172A", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Info Banner
  infoBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EFF6FF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20, borderWidth: 1, borderColor: "#BFDBFE" },
  infoText: { fontSize: 13, color: BLUE, flex: 1 },

  // Card
  card: { flexDirection: "row", gap: 12, marginBottom: 0 },
  cardLeft: { alignItems: "center", width: 44 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", zIndex: 1 },
  connector: { width: 2, flex: 1, backgroundColor: "#E2E8F0", marginVertical: 4 },
  cardContent: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1, marginRight: 8 },
  cardType: { fontSize: 12, color: "#9CA3AF", marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardDate: { fontSize: 12, color: "#9CA3AF", marginRight: 8 },
  cardDistance: { fontSize: 12, color: "#9CA3AF" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
});