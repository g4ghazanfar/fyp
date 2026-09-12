import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "@/data/api";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";

type ScanResult = {
  foodName: string;
  estimatedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "medium" | "low";
  notes: string;
};

export default function ScanFoodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const chooseImage = async (source: "camera" | "gallery") => {
    setMessage("");
    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage(source === "camera" ? "Camera permission allow کریں۔" : "Gallery permission allow کریں۔");
      return;
    }
    const picker = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.8 });
    if (!picker.canceled && picker.assets[0]) {
      setImage(picker.assets[0]);
      setResult(null);
      setMessage("");
    }
  };

  const scanFood = async () => {
    if (!image) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy(true);
    setResult(null);
    setMessage("");
    try {
      const upload = await FileSystem.uploadAsync(API_BASE_URL + "/ai/scan-food", image.uri, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: image.mimeType || "image/jpeg",
      });
      const body = JSON.parse(upload.body || "{}");
      if (upload.status !== 200) throw new Error(body.error || "Food scan failed");
      setResult(body as ScanResult);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Food scan failed. دوبارہ کوشش کریں۔");
    } finally {
      setBusy(false);
    }
  };

  const confidenceColor = result?.confidence === "high" ? "#16A34A" : result?.confidence === "medium" ? "#CA8A04" : "#6B7280";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Food Photo Scanner</Text>
          <Text style={styles.headerSubtitle}>تصویر سے غذائیت معلوم کریں</Text>
        </View>
        <Feather name="camera" size={24} color="#fff" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.emptyPreview}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
                <Feather name="camera" size={34} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Add a food photo</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Take a picture or choose one from your gallery.</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={() => chooseImage("camera")} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <Feather name="camera" size={19} color="#fff" />
            <Text style={styles.actionText}>Take photo</Text>
          </Pressable>
          <Pressable onPress={() => chooseImage("gallery")} style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}>
            <Feather name="image" size={19} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Gallery</Text>
          </Pressable>
        </View>

        {image ? (
          <Pressable disabled={busy} onPress={scanFood} style={[styles.scanButton, { backgroundColor: colors.secondary, opacity: busy ? 0.65 : 1 }]}>
            {busy ? <ActivityIndicator color="#fff" /> : <Feather name="zap" size={19} color="#fff" />}
            <Text style={styles.scanText}>{busy ? "Scanning..." : "Scan this food"}</Text>
          </Pressable>
        ) : null}

        {message ? <Text style={[styles.message, { color: colors.destructive }]}>{message}</Text> : null}

        {result ? (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleWrap}>
                <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Gemini Vision result</Text>
                <Text style={[styles.foodName, { color: colors.foreground }]}>{result.foodName}</Text>
              </View>
              <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20" }]}>
                <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                <Text style={[styles.confidenceText, { color: confidenceColor }]}>{result.confidence}</Text>
              </View>
            </View>
            <View style={[styles.calorieBox, { backgroundColor: colors.accent }]}>
              <Text style={[styles.calorieNumber, { color: colors.primary }]}>{result.estimatedCalories}</Text>
              <Text style={[styles.calorieLabel, { color: colors.mutedForeground }]}>estimated calories</Text>
            </View>
            <View style={styles.macroRow}>
              {[{ label: "Protein", value: result.protein, color: "#2563EB" }, { label: "Carbs", value: result.carbs, color: "#CA8A04" }, { label: "Fat", value: result.fat, color: "#DC2626" }].map(macro => (
                <View key={macro.label} style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: macro.color }]}>{macro.value}g</Text>
                  <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{macro.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.notes, { color: colors.mutedForeground }]}>{result.notes}</Text>
            <Pressable onPress={() => setMessage(user ? "Meal noted successfully. Database logging will be added later." : "Meal scan complete. Login karke meal logging use kar سکیں گے۔")} style={[styles.logButton, { borderColor: colors.primary }]}>
              <Feather name="check-circle" size={18} color={colors.primary} />
              <Text style={[styles.logText, { color: colors.primary }]}>Log this meal</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  backButton: { padding: 4 },
  headerCopy: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, flexShrink: 1 },
  headerSubtitle: { color: "rgba(255,255,255,0.78)", fontSize: theme.type.xs, marginTop: 4 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  previewCard: { borderRadius: theme.radius.lg, borderWidth: 1, overflow: "hidden", minHeight: 230 },
  preview: { width: "100%", height: 280 },
  emptyPreview: { minHeight: 230, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium },
  emptyText: { fontSize: theme.type.sm, textAlign: "center", marginTop: 6, lineHeight: 19 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: theme.spacing.sm },
  actionButton: { flex: 1, minWidth: 0, minHeight: 48, borderRadius: theme.radius.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  actionText: { color: "#fff", fontSize: theme.type.sm, fontFamily: theme.fonts.bodyBold, flexShrink: 1 },
  scanButton: { minHeight: 52, borderRadius: theme.radius.sm, marginTop: theme.spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  scanText: { color: "#fff", fontSize: theme.type.sm, fontFamily: theme.fonts.bodyBold },
  message: { textAlign: "center", fontSize: theme.type.sm, marginTop: theme.spacing.sm, lineHeight: 19 },
  resultCard: { borderRadius: theme.radius.lg, borderWidth: 1, padding: theme.spacing.md, marginTop: theme.spacing.lg },
  resultHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  resultTitleWrap: { flex: 1 },
  resultLabel: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold, letterSpacing: 0.2 },
  foodName: { fontSize: theme.type.display, fontFamily: theme.fonts.heading, marginTop: 4, flexShrink: 1 },
  confidenceBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: theme.radius.pill, paddingHorizontal: 9, paddingVertical: 6, flexShrink: 0 },
  confidenceDot: { width: 7, height: 7, borderRadius: 4 },
  confidenceText: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodyBold },
  calorieBox: { borderRadius: theme.radius.sm, padding: theme.spacing.sm, marginTop: theme.spacing.md, alignItems: "center" },
  calorieNumber: { fontSize: 28, fontFamily: theme.fonts.heading },
  calorieLabel: { fontSize: theme.type.xs, marginTop: 2 },
  macroRow: { flexDirection: "row", marginTop: 18, gap: 8 },
  macroItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(128,128,128,0.08)" },
  macroValue: { fontSize: 16, fontWeight: "800" },
  macroLabel: { fontSize: 11, marginTop: 3 },
  notes: { fontSize: theme.type.sm, lineHeight: 19, marginTop: theme.spacing.md },
  logButton: { minHeight: 46, borderRadius: theme.radius.sm, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: theme.spacing.md },
  logText: { fontSize: theme.type.sm, fontFamily: theme.fonts.bodyBold },
});
