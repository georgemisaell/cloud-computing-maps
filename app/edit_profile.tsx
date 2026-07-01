import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView,
  StatusBar, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Linking
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

const BLUE = "#0EA5E9";
const DARK = "#0F172A";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url, phone")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setName(data?.name || "");
      setPhone(data?.phone || "");
      setAvatarUrl(data?.avatar_url || null);
    } catch (error: any) {
      Alert.alert("Error", "Gagal memuat profil: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Izin dibutuhkan", 
        "Aplikasi butuh akses galeri untuk mengganti foto profil. Izinkan melalui Pengaturan HP Anda.",
        [
          { text: "Batal", style: "cancel" },
          { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        await uploadAvatar(asset.uri, asset.base64);
      } else {
        Alert.alert("Error", "Gagal membaca file gambar.");
      }
    }
  }

  async function uploadAvatar(uri: string, base64Str: string) {
    if (!userId) return;
    try {
      setUploading(true);

      const fileExt = uri.split(".").pop() || "jpg";
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64Str), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);

      // Auto-simpan URL avatar langsung ke tabel profiles agar tidak hilang saat back
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);
      
      if (profileError) {
        console.error("Gagal auto-save avatar_url:", profileError);
      }

    } catch (error: any) {
      Alert.alert("Error", "Gagal upload foto: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!userId) return;
    if (!name.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }

    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: name.trim(), phone: phone.trim(), avatar_url: avatarUrl })
        .eq("id", userId);

      if (profileError) throw profileError;

      const { data: { user } } = await supabase.auth.getUser();
      if (email.trim() && email.trim() !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
        if (emailError) throw emailError;
        Alert.alert(
          "Berhasil",
          "Profil disimpan. Cek email baru Anda untuk konfirmasi perubahan alamat email.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      Alert.alert("Berhasil", "Profil berhasil diperbarui", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", "Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${name || "User"}&background=random` }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Ketuk ikon kamera untuk ganti foto</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Masukkan nama lengkap"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Masukkan email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Nomor HP</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Masukkan nomor HP"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving || uploading}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: DARK, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  avatarSection: { alignItems: "center", marginTop: 24, marginBottom: 8 },
  avatarWrap: { width: 100, height: 100, position: "relative" },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: BLUE },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: BLUE, justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#F1F5F9",
  },
  avatarHint: { fontSize: 12, color: "#9CA3AF", marginTop: 10 },

  formSection: { paddingHorizontal: 20, marginTop: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#111827", borderWidth: 1, borderColor: "#E5E7EB",
  },

  saveBtn: {
    backgroundColor: BLUE, marginHorizontal: 20, marginTop: 32, borderRadius: 16,
    paddingVertical: 16, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});