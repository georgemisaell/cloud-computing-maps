import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import LoginPrompt from "@/components/LoginPrompt";

const BLUE = "#0EA5E9";

const iconMap: Record<string, string> = {
  Padel: "tennisball-outline",
  Badminton: "people-outline",
  Basket: "basketball-outline",
};

export default function HistoryScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchHistory = async () => {
        setLoading(true);
        const { data: authData } = await supabase.auth.getSession();
        const sess = authData.session;
        if (isActive) {
          setSession(sess);
        }

        if (sess) {
          const { data, error } = await supabase
            .from("user_route_history")
            .select(`
              id,
              created_at,
              places (
                id,
                name,
                address,
                lat,
                lng,
                categories (
                  name
                )
              )
            `)
            .eq("user_id", sess.user.id)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching history:", error);
          } else if (isActive) {
            setHistoryList(data || []);
          }
        }
        if (isActive) {
          setLoading(false);
        }
      };
      
      fetchHistory();
      
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", backgroundColor: "#0F172A" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <LoginPrompt message="Silakan login untuk melihat riwayat rute Anda." />
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Info */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={BLUE} />
          <Text style={styles.infoText}>Menampilkan riwayat tempat yang rutenya pernah Anda lihat</Text>
        </View>

        {/* List */}
        {historyList.map((item, index) => {
          const place = item.places;
          const categoryName = place?.categories?.name || "Lainnya";
          const iconName = iconMap[categoryName] || "location-outline";

          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => {
                if (place) {
                   router.push({
                     pathname: "/detail_tempat",
                     params: { id: place.id }
                   });
                }
              }}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name={iconName as any} size={22} color={BLUE} />
                </View>
                {index < historyList.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{place?.name || "Tempat tidak diketahui"}</Text>
                </View>
                <Text style={styles.cardType}>{categoryName}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {historyList.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="time-outline" size={48} color="#CBD5E1" />
            <Text style={{ marginTop: 12, color: "#64748B", fontSize: 14 }}>Belum ada riwayat rute.</Text>
          </View>
        )}

        {/* Empty space */}
        <View style={{ height: 20 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },

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
});