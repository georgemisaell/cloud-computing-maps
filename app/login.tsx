import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
        email,
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
        email,
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
        <Text style={styles.title}>{isSignUp ? "Daftar Akun" : "Login ke CC-Maps"}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Lengkapi data untuk mendaftar" : "Silakan masuk untuk melanjutkan"}
        </Text>

        {/* Input Nama (Hanya saat daftar) */}
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}

        {/* Input Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
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
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    width: "85%",
    backgroundColor: "#1e222b",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#2a2f3b",
    color: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonLogin: {
    backgroundColor: "#02b875",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  buttonSignUp: {
    width: "100%",
    paddingVertical: 10,
  },
  buttonSignUpText: {
    color: "#02b875",
    fontSize: 14,
    textAlign: "center",
  },
});
