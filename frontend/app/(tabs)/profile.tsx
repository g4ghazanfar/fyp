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
import { theme } from "@/constants/theme";

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
            <Text style={styles.statVal}>{user?.healthProfile?.fitnessGoal?.split(" ")[0] ?? "—"}</Text>
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
                  <Text style={[styles.profileVal, { color: colors.foreground }]}>{item.val ?? "—"}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.profileCard, { backgroundColor: colors.card, marginTop: 16 }]}>
              <Text style={[styles.profileCardTitle, { color: colors.foreground }]}>Allergies</Text>
              <View style={styles.tags}>
                {(user?.healthProfile?.allergies ?? []).map(a => (
                  <View key={a} style={[styles.tag, { backgroundColor: colors.warningSoft }]}>
                    <Text style={[styles.tagText, { color: colors.warning }]}>{a}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.profileCardTitle, { color: colors.foreground, marginTop: 14 }]}>Conditions</Text>
              <View style={styles.tags}>
                {(user?.healthProfile?.conditions ?? []).map(c => (
                  <View key={c} style={[styles.tag, { backgroundColor: colors.errorSoft }]}>
                    <Text style={[styles.tagText, { color: colors.destructive }]}>{c}</Text>
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
  header: { alignItems: "center", paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: theme.spacing.sm },
  name: { color: "#fff", fontSize: theme.type.display, fontFamily: theme.fonts.heading },
  email: { color: "rgba(255,255,255,0.75)", fontSize: theme.type.sm, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 0, marginTop: theme.spacing.lg, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: theme.radius.md, padding: theme.spacing.md, width: "100%" },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, flexShrink: 1, textAlign: "center" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: theme.type.xs, marginTop: 4, textAlign: "center" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 14, paddingHorizontal: theme.spacing.xs, borderBottomWidth: 2 },
  tabText: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold, textAlign: "center", flexShrink: 1 },
  sectionTitle: { fontSize: theme.type.display, fontFamily: theme.fonts.heading, marginBottom: 4 },
  sectionSub: { fontSize: theme.type.sm, marginBottom: theme.spacing.md, flexShrink: 1 },
  tipCard: { flexDirection: "row", gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 7, elevation: 1 },
  tipIcon: { width: 52, height: 52, borderRadius: theme.radius.sm, alignItems: "center", justifyContent: "center" },
  tipHeader: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.xs },
  tipTitle: { fontSize: theme.type.sm, fontFamily: theme.fonts.headingMedium, flex: 1, flexShrink: 1 },
  catBadge: { paddingHorizontal: theme.spacing.xs, paddingVertical: theme.spacing.xxs, borderRadius: theme.radius.pill, flexShrink: 0 },
  catBadgeText: { fontSize: 10, fontFamily: theme.fonts.bodySemibold },
  tipUrdu: { fontSize: theme.type.sm, marginTop: 4, fontFamily: theme.fonts.bodySemibold },
  tipDesc: { fontSize: theme.type.xs, marginTop: 6, lineHeight: 18 },
  tipDescUrdu: { fontSize: theme.type.xs, marginTop: 4, lineHeight: 18, textAlign: "right" },
  reportGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  reportCard: { flex: 1, padding: theme.spacing.lg, borderRadius: theme.radius.md, alignItems: "center" },
  reportVal: { color: "#fff", fontSize: 28, fontFamily: theme.fonts.heading },
  reportLabel: { color: "rgba(255,255,255,0.85)", fontSize: theme.type.xs, marginTop: 4, textAlign: "center" },
  chartCard: { borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.md, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 7, elevation: 1 },
  chartTitle: { fontSize: theme.type.body, fontFamily: theme.fonts.headingMedium, marginBottom: theme.spacing.md },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barBg: { width: "100%", flex: 1, borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10 },
  barVal: { fontSize: 9 },
  achieveTitle: { fontSize: theme.type.body, fontFamily: theme.fonts.headingMedium, marginBottom: theme.spacing.sm },
  achievements: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achieveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  achieveText: { fontSize: theme.type.sm, fontFamily: theme.fonts.bodySemibold, flexShrink: 1 },
  profileCard: { borderRadius: theme.radius.md, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 7, elevation: 1 },
  profileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  profileLabel: { fontSize: theme.type.sm, flexShrink: 1 },
  profileVal: { fontSize: theme.type.sm, fontFamily: theme.fonts.bodySemibold, flex: 1, flexShrink: 1, marginLeft: theme.spacing.sm, textAlign: "right" },
  profileCardTitle: { fontSize: theme.type.sm, fontFamily: theme.fonts.headingMedium, padding: theme.spacing.sm, paddingBottom: theme.spacing.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, paddingBottom: theme.spacing.sm },
  tag: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.pill },
  tagText: { fontSize: theme.type.sm, fontFamily: theme.fonts.bodySemibold, flexShrink: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: theme.radius.md, borderWidth: 1.5, marginTop: theme.spacing.lg },
  logoutText: { fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold },
});
