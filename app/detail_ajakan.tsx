import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BLUE = "#2563EB";

function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DetailAjakanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [ajakan, setAjakan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: authData } = await supabase.auth.getUser();
      setCurrentUser(authData.user);

      const { data, error } = await supabase
        .from("ajakan")
        .select(`
          id, sport, level, tanggal, jam_mulai, jam_selesai, kuota, wa_link,
          venue:places!ajakan_venue_id_fkey(name, address),
          participants:ajakan_peserta(
            user_id, 
            is_host, 
            profile:profiles!ajakan_peserta_user_id_fkey(name, avatar_url)
          )
        `)
        .eq("id", id)
        .single();

      if (data) {
        setAjakan(data);
      } else if (error) {
        console.error(error);
        Alert.alert("Error", "Gagal memuat detail ajakan");
      }
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleJoin = async () => {
    if (!currentUser) {
      Alert.alert("Login Dibutuhkan", "Silakan login untuk bergabung.");
      return;
    }

    setJoining(true);
    try {
      const { error } = await supabase
        .from("ajakan_peserta")
        .insert({
          ajakan_id: ajakan.id,
          user_id: currentUser.id,
          is_host: false,
        });

      if (error) {
        if (error.code === '23505') { // unique violation
          Alert.alert("Info", "Anda sudah bergabung dalam ajakan ini.");
        } else {
          throw error;
        }
      } else {
        Alert.alert("Berhasil", "Anda telah bergabung!");

        // Refresh participants locally to avoid extra fetch
        const { data: myProfile } = await supabase.from("profiles").select("name, avatar_url").eq("id", currentUser.id).single();

        setAjakan((prev: any) => ({
          ...prev,
          participants: [
            ...prev.participants,
            {
              user_id: currentUser.id,
              is_host: false,
              profile: myProfile
            }
          ]
        }));
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Gagal bergabung.");
    } finally {
      setJoining(false);
    }
  };

  const handleWA = () => {
    if (ajakan?.wa_link) {
      Linking.openURL(ajakan.wa_link).catch(() => {
        Alert.alert("Error", "Tidak dapat membuka link WhatsApp");
      });
    } else {
      Alert.alert("Info", "Pembuat ajakan belum menyertakan link WhatsApp.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Hapus Ajakan", "Apakah Anda yakin ingin menghapus ajakan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase.from("ajakan").delete().eq("id", ajakan.id);
            if (error) throw error;
            Alert.alert("Berhasil", "Ajakan telah dihapus.");
            router.back();
          } catch (err: any) {
            setLoading(false);
            Alert.alert("Error", err.message || "Gagal menghapus ajakan");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!ajakan) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Ajakan tidak ditemukan.</Text>
      </View>
    );
  }

  const joinedCount = ajakan.participants?.length || 0;
  const sisa = ajakan.kuota - joinedCount;

  const isJoined = ajakan.participants?.some((p: any) => p.user_id === currentUser?.id);
  const isHost = ajakan.participants?.some((p: any) => p.user_id === currentUser?.id && p.is_host);
  const isFull = sisa <= 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail ajakan main</Text>
        <View style={{ flex: 1 }} />
        {isHost && (
          <TouchableOpacity onPress={handleDelete} style={{ padding: 4, marginRight: 10 }}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Venue card */}
        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{ajakan.venue?.name || "Lokasi tidak diketahui"}</Text>
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
              📅 {formatDate(ajakan.tanggal)} • {ajakan.jam_mulai.substring(0, 5)} - {ajakan.jam_selesai.substring(0, 5)} WIB
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#EF4444" />
            <Text style={styles.infoText}>{ajakan.venue?.address || "-"}</Text>
          </View>
        </View>

        {/* Peserta */}
        <View style={styles.pesertaHeader}>
          <Text style={styles.pesertaTitle}>
            Peserta ({joinedCount}/{ajakan.kuota})
          </Text>
          <Text style={styles.pesertaSisa}>
            {sisa > 0 ? `Butuh ${sisa} orang lagi` : "Sudah penuh"}
          </Text>
        </View>

        {ajakan.participants?.sort((a: any, b: any) => b.is_host - a.is_host).map((p: any, i: number) => {
          const profileName = p.profile?.name || "User";
          return (
            <View key={i} style={styles.pesertaRow}>
              <View style={[styles.pesertaAvatar, { backgroundColor: "#DBEAFE" }]}>
                {p.profile?.avatar_url ? (
                  <Image source={{ uri: p.profile.avatar_url }} style={styles.pesertaAvatarImg} />
                ) : (
                  <Text style={[styles.pesertaAvatarText, { color: "#2563EB" }]}>{getInitials(profileName)}</Text>
                )}
              </View>
              <Text style={styles.pesertaName}>
                {profileName} {p.user_id === currentUser?.id ? "(Anda)" : ""}
              </Text>
              {p.is_host && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.joinBtn,
            (isJoined || isFull) && !isJoined ? { backgroundColor: "#9CA3AF" } : {},
            isJoined ? { backgroundColor: "#10B981" } : {}
          ]}
          onPress={handleJoin}
          disabled={joining || isJoined || isFull}
        >
          {joining ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.joinBtnText}>
              {isJoined ? "Sudah Bergabung" : isFull ? "Kuota Penuh" : "Gabung sekarang"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Only show WA button if joined, OR if it's open for everyone, but usually for participants only */}
        {(isJoined && ajakan.wa_link) ? (
          <TouchableOpacity
            style={styles.waBtn}
            onPress={handleWA}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#059669" />
            <Text style={styles.waBtnText}>Grup WA</Text>
          </TouchableOpacity>
        ) : null}
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
  pesertaAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  pesertaAvatarImg: { width: "100%", height: "100%" },
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  joinBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  waBtnText: { color: "#059669", fontSize: 14, fontWeight: "700" },
});
