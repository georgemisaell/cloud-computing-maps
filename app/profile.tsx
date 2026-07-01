import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import LoginPrompt from "@/components/LoginPrompt";

const BLUE = "#0EA5E9";
const DARK = "#0F172A";

export default function ProfileScreen() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; email: string; avatar_url: string | null } | null>(null);
  const [favCount, setFavCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const { count, error: countError } = await supabase
          .from("favorites")
          .select('*', { count: 'exact', head: true })
          .eq("user_id", user.id);

        if (!countError && count !== null) {
          setFavCount(count);
        }

        setProfile({
          name: data?.name || "User",
          email: user.email || "",
          avatar_url: data?.avatar_url,
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              router.replace("/login");
            }
          },
        },
      ]
    );
  }

  const theme = {
    bg: isDark ? "#0F172A" : "#F1F5F9",
    card: isDark ? "#1E293B" : "#fff",
    text: isDark ? "#F8FAFC" : "#111827",
    subText: isDark ? "#94A3B8" : "#9CA3AF",
    divider: isDark ? "#334155" : "#F9FAFB",
    menuSub: isDark ? "#64748B" : "#9CA3AF",
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!profile) {
    return <LoginPrompt message="Silakan login untuk melihat profil Anda." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Header */}
        <View style={styles.hero}>
          <Ionicons name="ellipse" size={300} color="rgba(14,165,233,0.07)" style={styles.bgCircle1} />
          <Ionicons name="ellipse" size={200} color="rgba(14,165,233,0.05)" style={styles.bgCircle2} />

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <Image 
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}&background=random` }} 
                style={styles.avatar} 
              />
            </View>
            <Text style={styles.heroName}>{profile?.name}</Text>
            <Text style={styles.heroEmail}>{profile?.email}</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit_profile")}>
            <Ionicons name="pencil-outline" size={14} color={DARK} />
            <Text style={styles.editBtnText}>Edit Profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="heart" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{favCount}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Favorit</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="location" size={22} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Dikunjungi</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />

          <TouchableOpacity style={styles.statCard} onPress={() => setIsDark(!isDark)}>
            <View style={[styles.statIcon, { backgroundColor: isDark ? "#FEF3C7" : "#EEF2FF" }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={isDark ? "#F59E0B" : "#6366F1"} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text, fontSize: 16, lineHeight: 28 }]}>{isDark ? "Light" : "Dark"}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Mode</Text>
          </TouchableOpacity>

        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: theme.subText }]}>Menu</Text>

          <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/Riwayat Lokasi")}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="time-outline" size={18} color={BLUE} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>Riwayat Lokasi</Text>
                <Text style={[styles.menuSub, { color: theme.menuSub }]}>Lihat tempat yang pernah dikunjungi</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.divider }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.logoutText}>Logout</Text>
                <Text style={[styles.menuSub, { color: theme.menuSub }]}>Keluar dari akun</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: { backgroundColor: DARK, paddingTop: 60, paddingBottom: 32, alignItems: "center", overflow: "hidden" },
  bgCircle1: { position: "absolute", top: -80, right: -80 },
  bgCircle2: { position: "absolute", bottom: -40, left: -60 },

  toggleBtn: { position: "absolute", top: 20, right: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },

  avatarSection: { alignItems: "center", marginBottom: 16 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: BLUE, padding: 3, marginBottom: 12 },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
  heroName: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 4 },
  heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: -1 },

  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  editBtnText: { color: DARK, fontSize: 13, fontWeight: "700" },

  // Stats
  statsContainer: { flexDirection: "row", borderRadius: 24, marginHorizontal: 20, marginTop: -20, marginBottom: 24, elevation: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, justifyContent: "space-around", alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  statCard: { alignItems: "center", gap: 8 },
  statDivider: { width: 1, height: 56 },
  statIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 12 },

  // Menu
  menuSection: { paddingHorizontal: 20, marginBottom: 20 },
  menuSectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  menuCard: { borderRadius: 24, elevation: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  menuIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600" },
  menuSub: { fontSize: 12, marginTop: 2 },
  menuDivider: { height: 1 },
  logoutText: { fontSize: 15, color: "#EF4444", fontWeight: "600" },
});