import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image } from "react-native";
import { supabase } from "@/lib/supabase";
import LoginPrompt from "@/components/LoginPrompt";

const BLUE = "#2563EB";

const categories = ["Semua", "Badminton", "Futsal", "Padel", "Basket", "Renang"];

export const dummyAjakan: any[] = []; // Temporary export for detail_ajakan.tsx

const sportColors: Record<string, { bg: string; text: string }> = {
  Badminton: { bg: "#EFF6FF", text: "#2563EB" },
  Futsal: { bg: "#FFF7ED", text: "#EA580C" },
  Padel: { bg: "#F5F3FF", text: "#7C3AED" },
  Basket: { bg: "#FEF2F2", text: "#DC2626" },
  Renang: { bg: "#ECFEFF", text: "#0891B2" },
};

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Baru saja";
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function MainBarengScreen() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  const [ajakanList, setAjakanList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [userProfile, setUserProfile] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchAll = async () => {
        setLoadingSession(true);
        const { data: authData } = await supabase.auth.getSession();
        
        if (isActive) {
          setSession(authData.session);
          
          if (authData.session) {
            // Fetch current user profile for header avatar
            const { data: profile } = await supabase.from("profiles").select("name, avatar_url").eq("id", authData.session.user.id).single();
            setUserProfile(profile);
            
            // Fetch ajakan list
            const { data: list, error } = await supabase
              .from("ajakan")
              .select(`
                id, sport, level, tanggal, jam_mulai, jam_selesai, kuota, created_at, wa_link,
                host:profiles!ajakan_host_id_fkey(name, avatar_url),
                venue:places!ajakan_venue_id_fkey(name, address),
                ajakan_peserta(count)
              `)
              .order("created_at", { ascending: false });
              
            if (!error && list) {
              setAjakanList(list);
            }
          }
          
          setLoadingSession(false);
          setLoadingData(false);
        }
      };
      fetchAll();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const filtered = ajakanList.filter(
    (a) => selectedCat === "Semua" || a.sport === selectedCat
  );

  if (loadingSession || loadingData) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!session) {
    return <LoginPrompt message="Silakan login untuk bergabung atau membuat ajakan main bareng." />;
  }

  return (
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
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <View style={styles.avatar}>
              {userProfile?.avatar_url ? (
                <Image source={{ uri: userProfile.avatar_url }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(userProfile?.name)}</Text>
              )}
            </View>
          </TouchableOpacity>
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
          const hostName = item.host?.name || "User";
          const joinedCount = item.ajakan_peserta[0]?.count || 0;
          const jamMulai = item.jam_mulai.substring(0, 5);
          const jamSelesai = item.jam_selesai.substring(0, 5);
          
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => router.push({ pathname: "/detail_ajakan", params: { id: item.id } })}
            >
              {/* top row */}
              <View style={styles.cardTop}>
                <View style={styles.hostRow}>
                  <View style={[styles.hostAvatar, { backgroundColor: "#DBEAFE" }]}>
                    {item.host?.avatar_url ? (
                      <Image source={{ uri: item.host.avatar_url }} style={styles.hostAvatarImg} />
                    ) : (
                      <Text style={[styles.hostAvatarText, { color: "#2563EB" }]}>
                        {getInitials(hostName)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.hostName}>{hostName}</Text>
                    <Text style={styles.timeAgo}>{getTimeAgo(item.created_at)}</Text>
                  </View>
                </View>
                <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.sportBadgeText, { color: sc.text }]}>{item.sport}</Text>
                </View>
              </View>

              {/* venue */}
              <Text style={styles.venue}>{item.venue?.name || "Lokasi tidak diketahui"}</Text>

              {/* meta */}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>📅 {formatDate(item.tanggal)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{jamMulai} - {jamSelesai} WIB</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="people" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {joinedCount}/{item.kuota} orang
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
                  <Text style={styles.gabungBtnText}>Lihat</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 12 },

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
    overflow: "hidden"
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarText: { color: "#2563EB", fontWeight: "700", fontSize: 16 },

  chipRowWrap: { marginTop: 12, marginBottom: 4 },
  chipRow: { paddingHorizontal: 20, gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActive: { color: "#fff" },

  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16, gap: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  hostAvatarImg: { width: "100%", height: "100%" },
  hostAvatarText: { fontSize: 13, fontWeight: "700" },
  hostName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  timeAgo: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  sportBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sportBadgeText: { fontSize: 11, fontWeight: "700" },

  venue: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  metaText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  metaDot: { color: "#D1D5DB" },

  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  levelChip: { backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelChipText: { fontSize: 11, fontWeight: "600", color: "#4B5563" },
  gabungBtn: { backgroundColor: BLUE, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  gabungBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: "#6B7280", fontWeight: "500" },
});
