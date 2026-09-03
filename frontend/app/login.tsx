import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function Login() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.replace("/(tabs)/home");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
          <Feather name="heart" size={36} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>خوش آمدید</Text>

        <View style={styles.form}>
          <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.btnText}>Login</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </Pressable>

          <Pressable onPress={() => router.replace("/register")} style={styles.link}>
            <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
              New user? <Text style={{ color: colors.primary, fontWeight: "700" }}>Create Account</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, alignItems: "center", justifyContent: "center" },
  logoBox: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 4, marginBottom: 40 },
  form: { width: "100%", gap: 14 },
  inputBox: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 16 },
  error: { color: "#EF4444", fontSize: 13, textAlign: "center" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 16 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  link: { alignItems: "center", marginTop: 8 },
  linkText: { fontSize: 14 },
});
