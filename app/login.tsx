import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }

    if (isSignUp && !fullName) {
      Alert.alert("Error", "Nama lengkap harus diisi");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: fullName,
          },
        },
      });

      if (error) {
        Alert.alert("Registrasi Gagal", error.message);
      } else {
        Alert.alert("Sukses", "Silakan cek email Anda untuk verifikasi (jika diaktifkan)");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Login Gagal", error.message);
      } else {
        router.replace("/");
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.formCard}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>{isSignUp ? "Daftar Akun" : "Login ke CC-Maps"}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Lengkapi data untuk mendaftar" : "Silakan masuk untuk melanjutkan"}
        </Text>

        {/* Input Nama (Hanya saat daftar) */}
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}

        {/* Input Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Tombol Utama */}
        <TouchableOpacity
          style={[styles.buttonLogin, loading && { opacity: 0.7 }]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Memproses..." : isSignUp ? "Daftar Sekarang" : "Masuk"}
          </Text>
        </TouchableOpacity>

        {/* Toggle Mode */}
        <TouchableOpacity
          style={[styles.buttonSignUp, { marginTop: 12 }]}
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          <Text style={styles.buttonSignUpText}>
            {isSignUp ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F7",
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  title: {
    color: "#1A1A2E",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    color: "#1A1A2E",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 15,
  },
  buttonLogin: {
    backgroundColor: "#00BFA5",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: "#00BFA5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  buttonSignUp: {
    width: "100%",
    paddingVertical: 14,
  },
  buttonSignUpText: {
    color: "#00BFA5",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
