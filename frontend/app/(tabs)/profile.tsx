import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { HEALTH_TIPS, WEEKLY_REPORT } from "@/data/healthTips";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isWeb = Platform.OS === "web";
  const [activeTab, setActiveTab] = useState<"tips" | "report" | "profile">("tips");

  const maxCal = Math.max(...WEEKLY_REPORT.calories.map(c => c.value));

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace("/onboarding");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with user info */}
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="user" size={36} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name ?? "User"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{user?.points ?? 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{user?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{user?.healthProfile?.fitnessGoal?.split(" ")[0] ?? "—"}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["tips", "report", "profile"] as const).map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, { borderBottomColor: activeTab === tab ? colors.primary : "transparent" }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "tips" ? "Health Tips" : tab === "report" ? "Weekly Report" : "Profile"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {activeTab === "tips" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Health Tips For You</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Based on your profile: {user?.healthProfile?.fitnessGoal}
            </Text>
            {HEALTH_TIPS.map(tip => (
              <View key={tip.id} style={[styles.tipCard, { backgroundColor: colors.card }]}>
                <View style={[styles.tipIcon, { backgroundColor: tip.color + "20" }]}>
                  <Text style={{ fontSize: 24 }}>{tip.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.tipHeader}>
                    <Text style={[styles.tipTitle, { color: colors.foreground }]}>{tip.title}</Text>
                    <View style={[styles.catBadge, { backgroundColor: tip.color + "20" }]}>
                      <Text style={[styles.catBadgeText, { color: tip.color }]}>{tip.category}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tipUrdu, { color: colors.primary }]}>{tip.titleUrdu}</Text>
                  <Text style={[styles.tipDesc, { color: colors.mutedForeground }]}>{tip.description}</Text>
                  <Text style={[styles.tipDescUrdu, { color: colors.mutedForeground }]}>{tip.descriptionUrdu}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "report" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Report</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{WEEKLY_REPORT.week}</Text>

            <View style={styles.reportGrid}>
              <View style={[styles.reportCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.reportVal}>{WEEKLY_REPORT.healthyMeals}/{WEEKLY_REPORT.totalMeals}</Text>
                <Text style={styles.reportLabel}>Healthy Meals</Text>
              </View>
              <View style={[styles.reportCard, { backgroundColor: colors.secondary }]}>
                <Text style={styles.reportVal}>{Math.round(WEEKLY_REPORT.healthyMeals / WEEKLY_REPORT.totalMeals * 100)}%</Text>
                <Text style={styles.reportLabel}>Health Score</Text>
              </View>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Daily Calories</Text>
              <View style={styles.chart}>
                {WEEKLY_REPORT.calories.map(day => (
                  <View key={day.day} style={styles.barGroup}>
                    <View style={[styles.barBg, { backgroundColor: colors.input }]}>
                      <View style={[styles.bar, {
                        backgroundColor: colors.primary,
                        height: `${(day.value / maxCal) * 100}%` as any,
                      }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.day}</Text>
                    <Text style={[styles.barVal, { color: colors.foreground }]}>{day.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.achieveTitle, { color: colors.foreground }]}>Achievements</Text>
            <View style={styles.achievements}>
              {WEEKLY_REPORT.achievements.map(a => (
                <View key={a} style={[styles.achieveBadge, { backgroundColor: colors.accent }]}>
                  <Feather name="award" size={14} color={colors.primary} />
                  <Text style={[styles.achieveText, { color: colors.primary }]}>{a}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === "profile" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Health Profile</Text>
            <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
              {[
                { label: "Age", val: user?.healthProfile?.age + " years" },
                { label: "Weight", val: user?.healthProfile?.weight + " kg" },
                { label: "Height", val: user?.healthProfile?.height + " cm" },
                { label: "Blood Type", val: user?.healthProfile?.bloodType },
                { label: "Fitness Goal", val: user?.healthProfile?.fitnessGoal },
              ].map(item => (
                <View key={item.label} style={[styles.profileRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.profileLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.profileVal, { color: colors.foreground }]} numberOfLines={2}>{item.val ?? "—"}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.profileCard, { backgroundColor: colors.card, marginTop: 16 }]}>
              <Text style={[styles.profileCardTitle, { color: colors.foreground }]}>Allergies</Text>
              <View style={styles.tags}>
                {(user?.healthProfile?.allergies ?? []).map(a => (
                  <View key={a} style={[styles.tag, { backgroundColor: "#FEF3C7" }]}>
                    <Text style={[styles.tagText, { color: "#D97706" }]}>{a}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.profileCardTitle, { color: colors.foreground, marginTop: 14 }]}>Conditions</Text>
              <View style={styles.tags}>
                {(user?.healthProfile?.conditions ?? []).map(c => (
                  <View key={c} style={[styles.tag, { backgroundColor: "#FEE2E2" }]}>
                    <Text style={[styles.tagText, { color: "#EF4444" }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.destructive }]}>
              <Feather name="log-out" size={18} color={colors.destructive} />
              <Text style={[styles.logoutText, { color: colors.destructive }]}>Logout</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  name: { color: "#fff", fontSize: 22, fontWeight: "800" },
  email: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 0, marginTop: 20, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, width: "100%" },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: 20, fontWeight: "800", flexShrink: 1, textAlign: "center" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 16 },
  tipCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  tipIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 10, fontWeight: "600" },
  tipUrdu: { fontSize: 13, marginTop: 2, fontWeight: "600" },
  tipDesc: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  tipDescUrdu: { fontSize: 12, marginTop: 4, lineHeight: 18, textAlign: "right" },
  reportGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  reportCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: "center" },
  reportVal: { color: "#fff", fontSize: 28, fontWeight: "800" },
  reportLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  chartCard: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barBg: { width: "100%", flex: 1, borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10 },
  barVal: { fontSize: 9 },
  achieveTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  achievements: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achieveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  achieveText: { fontSize: 13, fontWeight: "600" },
  profileCard: { borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  profileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  profileLabel: { fontSize: 14, flexShrink: 1 },
  profileVal: { fontSize: 14, fontWeight: "600", flex: 1, flexShrink: 1, marginLeft: 12, textAlign: "right" },
  profileCardTitle: { fontSize: 14, fontWeight: "700", padding: 14, paddingBottom: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "600" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 16, borderWidth: 1.5, marginTop: 20 },
  logoutText: { fontSize: 16, fontWeight: "700" },
});
