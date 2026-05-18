// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function Login() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLoginSubmit = () => {
//     router.replace("/");
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <View style={styles.formCard}>
//         <Text style={styles.title}>Login ke CC-Maps</Text>
//         <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan</Text>

//         {/* Input Email */}
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           placeholderTextColor="#aaa"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         {/* Input Password */}
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           placeholderTextColor="#aaa"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//         />

//         {/* Tombol Masuk */}
//         <TouchableOpacity
//           style={styles.buttonLogin}
//           onPress={handleLoginSubmit}
//         >
//           <Text style={styles.buttonText}>Masuk</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#25292e",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   formCard: {
//     width: "85%",
//     backgroundColor: "#1e222b",
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   title: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 4,
//   },
//   subtitle: {
//     color: "#aaa",
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     width: "100%",
//     backgroundColor: "#2a2f3b",
//     color: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   buttonLogin: {
//     backgroundColor: "#02b875",
//     width: "100%",
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });
