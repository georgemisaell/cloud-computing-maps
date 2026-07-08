import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";

const BLUE = "#2563EB";

const levels = ["Santai", "Kompetitif", "Semua level"];

export default function BuatAjakanScreen() {
  const router = useRouter();
  
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [showVenueModal, setShowVenueModal] = useState(false);
  
  const [sport, setSport] = useState("Badminton");
  const [level, setLevel] = useState("Santai");
  const [quota, setQuota] = useState(4);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVenues() {
      const { data } = await supabase.from("places").select("id, name, address, category:categories(name)").order("name");
      if (data) {
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenue(data[0]);
          if (data[0].category?.name) {
            setSport(data[0].category.name);
          }
        }
      }
    }
    fetchVenues();
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleCreate = async () => {
    if (!selectedVenue) {
      Alert.alert("Error", "Pilih tempat terlebih dahulu.");
      return;
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Silakan login terlebih dahulu.");
        return;
      }
      
      const tanggalStr = date.toISOString().split("T")[0];
      const jamMulai = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;
      
      const endJam = new Date(date);
      endJam.setHours(endJam.getHours() + 2); // Default durasi 2 jam
      const jamSelesai = `${endJam.getHours().toString().padStart(2, "0")}:${endJam.getMinutes().toString().padStart(2, "0")}:00`;
      
      const { data: ajakan, error: ajakanError } = await supabase
        .from("ajakan")
        .insert({
          host_id: user.id,
          venue_id: selectedVenue.id,
          sport,
          level,
          tanggal: tanggalStr,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          kuota: quota,
        })
        .select()
        .single();
        
      if (ajakanError) throw ajakanError;
      
      // Auto join host
      const { error: joinError } = await supabase
        .from("ajakan_peserta")
        .insert({
          ajakan_id: ajakan.id,
          user_id: user.id,
          is_host: true,
        });
        
      if (joinError) throw joinError;
      
      Alert.alert("Berhasil", "Ajakan main berhasil dibuat!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Terjadi kesalahan saat membuat ajakan");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' });
  };
  
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={loading}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat ajakan main</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tempat */}
        <Text style={styles.label}>TEMPAT</Text>
        <View style={styles.venueBox}>
          <Text style={styles.venueText}>{selectedVenue?.name || "Memuat tempat..."}</Text>
          <TouchableOpacity onPress={() => setShowVenueModal(true)}>
            <Text style={styles.ubahText}>Ubah</Text>
          </TouchableOpacity>
        </View>

        {/* Cabang olahraga - Auto dari Tempat */}
        <Text style={styles.label}>CABANG OLAHRAGA</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip, styles.chipActive]}>
            <Text style={[styles.chipText, styles.chipTextActive]}>{sport}</Text>
          </View>
        </View>

        {/* Tanggal & Jam */}
        <Text style={styles.label}>TANGGAL & JAM</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={BLUE} />
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={18} color={BLUE} />
            <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* Kuota orang */}
        <Text style={styles.label}>KUOTA ORANG (TERMASUK ANDA)</Text>
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
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Buat ajakan</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Date & Time Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onChangeDate}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      )}

      {/* Venue Modal */}
      <Modal visible={showVenueModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tempat</Text>
              <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={venues}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.venueItem} 
                  onPress={() => {
                    setSelectedVenue(item);
                    if (item.category?.name) {
                      setSport(item.category.name);
                    }
                    setShowVenueModal(false);
                  }}
                >
                  <Text style={styles.venueItemName}>{item.name}</Text>
                  <Text style={styles.venueItemAddress}>{item.address}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
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
  venueText: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 },
  ubahText: { fontSize: 14, fontWeight: "600", color: BLUE, marginLeft: 10 },

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

  dateTimeRow: { flexDirection: "row", gap: 12 },
  dateTimeBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateTimeText: { fontSize: 15, color: "#374151", fontWeight: "600" },

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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  venueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  venueItemName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  venueItemAddress: { fontSize: 13, color: "#6B7280", marginTop: 4 },
});
