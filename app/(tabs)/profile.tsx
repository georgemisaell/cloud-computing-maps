import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const BLUE = "#0EA5E9";

export default function ProfileScreen() {
  return (
    <View style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Profile</Text>
            {/* Profile Card */}
            <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>F</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Faizatun Nimah</Text>
                <Text style={styles.profileEmail}>faizatun.nimah@example.com</Text>
                <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit profile </Text>
                <Ionicons name="chevron-forward" size={13} color={BLUE} />
                </TouchableOpacity>
            </View>
            </View>
            {/* Stats */}
            <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="heart" size={18} color="#EF4444" />
                </View>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Favorit</Text>
            </View>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="location" size={18} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Dikunjungi</Text>
            </View>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="search" size={18} color={BLUE} />
                </View>
                <Text style={styles.statNumber}>45</Text>
                <Text style={styles.statLabel}>Pencarian</Text>
            </View>
            </View>
            {/* Menu */}
            <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.menuLabel}>Riwayat lokasi</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="eye-outline" size={20} color="#6B7280" />
                <Text style={styles.menuLabel}>Tempat terakhir dilihat</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            </View>
            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
        </View>
  );
}
const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 16 },
scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 16 },
profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, gap: 14 },
avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLUE, justifyContent: "center", alignItems: "center" },
avatarText: { color: "#fff", fontWeight: "700", fontSize: 26 },
profileInfo: { flex: 1 },
profileName: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 2 },
profileEmail: { fontSize: 12, color: "#6B7280", marginBottom: 10 },
editBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
editBtnText: { color: BLUE, fontSize: 12, fontWeight: "600" },
statsRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3, justifyContent: "space-around" },
statItem: { alignItems: "center", gap: 6 },
statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
statNumber: { fontSize: 20, fontWeight: "bold", color: "#111827" },
statLabel: { fontSize: 12, color: "#6B7280" },
menuSection: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, elevation: 3, overflow: "hidden" },
menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
menuLabel: { flex: 1, fontSize: 15, color: "#111827" },
menuDivider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
logoutBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 16, paddingHorizontal: 4 },
logoutText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
});
