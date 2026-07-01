import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BLUE = "#2563EB";

const sports = ["Badminton", "Futsal", "Padel", "Basket"];
const levels = ["Santai", "Kompetitif", "Semua level"];

export default function BuatAjakanScreen() {
  const router = useRouter();
  const [venue] = useState("GOR Arcadia Surabaya");
  const [sport, setSport] = useState("Badminton");
  const [level, setLevel] = useState("Santai");
  const [quota, setQuota] = useState(4);
  const [date] = useState("Sab, 28 Jun");
  const [time] = useState("08:00 WIB");

  const handleCreate = () => {
    // Data dummy — nanti kirim ke backend (lihat updateBackend1.md)
    Alert.alert("Ajakan dibuat", `${sport} • ${venue}\n${date} ${time} • ${quota} orang • ${level}`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat ajakan main</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tempat */}
        <Text style={styles.label}>TEMPAT</Text>
        <View style={styles.venueBox}>
          <Text style={styles.venueText}>{venue}</Text>
          <TouchableOpacity>
            <Text style={styles.ubahText}>Ubah</Text>
          </TouchableOpacity>
        </View>

        {/* Cabang olahraga */}
        <Text style={styles.label}>CABANG OLAHRAGA</Text>
        <View style={styles.chipRow}>
          {sports.map((s) => {
            const active = sport === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSport(s)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tanggal & Jam */}
        <View style={styles.rowHalf}>
          <View style={styles.half}>
            <Text style={styles.label}>TANGGAL</Text>
            <TouchableOpacity style={styles.inputBox}>
              <Text style={styles.inputText}>📅 {date}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>JAM</Text>
            <TouchableOpacity style={styles.inputBox}>
              <Text style={styles.inputText}>⏰ {time}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kuota orang */}
        <Text style={styles.label}>KUOTA ORANG</Text>
        <View style={styles.quotaBox}>
          <Text style={styles.quotaText}>{quota} orang</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuota((q) => Math.max(2, q - 1))}
            >
              <Ionicons name="remove" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuota((q) => q + 1)}
            >
              <Ionicons name="add" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Level main */}
        <Text style={styles.label}>LEVEL MAIN</Text>
        <View style={styles.chipRow}>
          {levels.map((l) => {
            const active = level === l;
            return (
              <TouchableOpacity
                key={l}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setLevel(l)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Buat ajakan</Text>
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

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },

  venueBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  venueText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  ubahText: { fontSize: 14, fontWeight: "600", color: BLUE },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: "#DBEAFE" },
  chipText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: BLUE },

  rowHalf: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  inputBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputText: { fontSize: 15, color: "#374151", fontWeight: "500" },

  quotaBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quotaText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  stepperRow: { flexDirection: "row", gap: 10 },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  createBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
