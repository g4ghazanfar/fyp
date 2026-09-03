import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Order, OrderStatus } from "@/context/OrderContext";

const STATUS_STEPS: { key: OrderStatus; label: string; labelUrdu: string; icon: string }[] = [
  { key: "confirmed", label: "Confirmed", labelUrdu: "تصدیق شدہ", icon: "check-circle" },
  { key: "preparing", label: "Preparing", labelUrdu: "تیاری جاری", icon: "clock" },
  { key: "picked_up", label: "Picked Up", labelUrdu: "اٹھا لیا", icon: "package" },
  { key: "on_way", label: "On the Way", labelUrdu: "راستے میں", icon: "truck" },
  { key: "delivered", label: "Delivered", labelUrdu: "پہنچ گیا", icon: "home" },
];

const STATUS_ORDER: OrderStatus[] = ["confirmed", "preparing", "picked_up", "on_way", "delivered"];

interface Props { order: Order }

export function OrderStatusCard({ order }: Props) {
  const colors = useColors();
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>{order.restaurant}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        </View>
        <View style={[styles.etaBadge, { backgroundColor: colors.accent }]}>
          <Feather name="clock" size={14} color={colors.primary} />
          <Text style={[styles.etaText, { color: colors.primary }]}> ~{order.estimatedTime} min</Text>
        </View>
      </View>

      <View style={styles.steps}>
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepDot, {
                  backgroundColor: done ? colors.primary : colors.border,
                  borderColor: active ? colors.primary : "transparent",
                  borderWidth: active ? 3 : 0,
                }]}>
                  <Feather name={step.icon as any} size={14} color={done ? "#fff" : colors.mutedForeground} />
                </View>
                {idx < STATUS_STEPS.length - 1 && (
                  <View style={[styles.line, { backgroundColor: done ? colors.primary : colors.border }]} />
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, { color: done ? colors.foreground : colors.mutedForeground, fontWeight: active ? "700" : "400" }]}>{step.label}</Text>
                <Text style={[styles.stepUrdu, { color: done ? colors.primary : colors.mutedForeground }]}>{step.labelUrdu}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.riderCard, { backgroundColor: colors.muted }]}>
        <View style={[styles.riderAvatar, { backgroundColor: colors.primary }]}>
          <Feather name="user" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.riderName, { color: colors.foreground }]}>{order.rider.name}</Text>
          <Text style={[styles.riderInfo, { color: colors.mutedForeground }]}>{order.rider.vehicle} · {order.rider.currentLocation}</Text>
        </View>
        <View style={styles.riderRight}>
          <Feather name="star" size={14} color="#F59E0B" />
          <Text style={[styles.riderRating, { color: colors.foreground }]}> {order.rider.rating}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
  etaBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  etaText: { fontSize: 13, fontWeight: "600" },
  steps: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepLeft: { alignItems: "center", width: 32 },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  line: { width: 2, height: 28, marginVertical: 2 },
  stepInfo: { flex: 1, paddingTop: 4, paddingBottom: 20 },
  stepLabel: { fontSize: 14 },
  stepUrdu: { fontSize: 12, marginTop: 2 },
  riderCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, marginTop: 8 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  riderName: { fontSize: 14, fontWeight: "600" },
  riderInfo: { fontSize: 12, marginTop: 2 },
  riderRight: { flexDirection: "row", alignItems: "center" },
  riderRating: { fontSize: 13, fontWeight: "600" },
});
