import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getMeals, getRecommendedMeals, Meal } from "@/data/meals";
import { MealCard } from "@/components/MealCard";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { HEALTH_TIPS } from "@/data/healthTips";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showVoice, setShowVoice] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recommended, setRecommended] = useState<Meal[]>([]);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getMeals(),
      user ? getRecommendedMeals(user.id) : Promise.resolve([]),
    ]).then(([allMeals, personalized]) => {
      if (!mounted) return;
      setMeals(allMeals);
      setRecommended(user ? personalized : allMeals);
    }).catch(() => {
      if (mounted) {
        setMeals([]);
        setRecommended([]);
      }
    });
    return () => { mounted = false; };
  }, [user?.id]);

  const filtered = search
    ? meals.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.nameUrdu.includes(search))
    : [];

  const topTip = HEALTH_TIPS[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.name?.split(" ")[0] ?? "Guest"} 👋</Text>
            {user?.healthProfile?.fitnessGoal ? (
              <Text style={styles.goal}>Goal: {user.healthProfile.fitnessGoal}</Text>
            ) : null}
          </View>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowVoice(true); }}
            style={styles.voiceBtn}>
            <Feather name="mic" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.body, { backgroundColor: colors.background }]}>
          {/* Points strip */}
          <View style={[styles.pointsStrip, { backgroundColor: colors.accent }]}>
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.primary }]}>
              {user?.points ?? 0} points · {user?.streak ?? 0} day streak
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Text style={[styles.viewReport, { color: colors.primary }]}>View Report →</Text>
            </Pressable>
          </View>

          {/* Search and food scanner */}
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={18} color={colors.mutedForeground} />
              <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search meals... (اردو میں بھی)" placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
              {search ? <Pressable onPress={() => setSearch("")}><Feather name="x" size={18} color={colors.mutedForeground} /></Pressable> : null}
            </View>
            <Pressable onPress={() => router.push("/scan-food")} style={[styles.scanButton, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={18} color="#fff" />
              <Text style={styles.scanButtonText}>Scan</Text>
            </Pressable>
          </View>

          {/* Search Results */}
          {search ? (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Search Results</Text>
              {filtered.length === 0 ? (
                <Text style={[styles.empty, { color: colors.mutedForeground }]}>No meals found</Text>
              ) : filtered.map(m => <MealCard key={m.id} meal={m} />)}
            </View>
          ) : (
            <>
              {/* Health Tip */}
              <Pressable style={[styles.tipCard, { backgroundColor: topTip.color + "15" }]}>
                <Text style={styles.tipIcon}>{topTip.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tipTitle, { color: colors.foreground }]}>{topTip.title}</Text>
                  <Text style={[styles.tipUrdu, { color: colors.mutedForeground }]}>{topTip.titleUrdu}</Text>
                  <Text style={[styles.tipDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{topTip.description}</Text>
                </View>
              </Pressable>

              {/* Recommended for you */}
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Recommended For You
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Based on your health profile — آپ کی صحت کے مطابق
              </Text>
              {recommended.slice(0, 3).map(m => <MealCard key={m.id} meal={m} />)}

              {/* Popular */}
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Popular Today</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
                {meals.slice(0, 5).map(m => <MealCard key={m.id} meal={m} compact />)}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      <VoiceAssistant visible={showVoice} onClose={() => setShowVoice(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  goal: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 },
  voiceBtn: { position: "absolute", right: 20, top: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  body: { borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 20, paddingTop: 24 },
  pointsStrip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
  pointsText: { flex: 1, fontSize: 13, fontWeight: "600" },
  viewReport: { fontSize: 12, fontWeight: "700" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  scanButton: { minWidth: 76, height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  scanButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  searchInput: { flex: 1, fontSize: 15 },
  tipCard: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 16, marginBottom: 20, alignItems: "center" },
  tipIcon: { fontSize: 32 },
  tipTitle: { fontSize: 15, fontWeight: "700" },
  tipUrdu: { fontSize: 13 },
  tipDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 16 },
  empty: { textAlign: "center", padding: 24, fontSize: 14 },
  horizontal: { marginHorizontal: -20, paddingLeft: 20 },
});
