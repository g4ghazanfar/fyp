import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useOrders } from "@/context/OrderContext";
import { OrderStatusCard } from "@/components/OrderStatusCard";
import { theme } from "@/constants/theme";

export default function TrackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, activeOrder } = useOrders();
  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Order Tracking</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>آرڈر ٹریکنگ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {activeOrder ? (
          <>
            <View style={[styles.activeBanner, { backgroundColor: colors.primary }]}>
              <Feather name="package" size={20} color="#fff" />
              <Text style={styles.activeBannerText}>Active Order</Text>
              <Text style={styles.activeBannerSub}>~{activeOrder.estimatedTime} min left</Text>
            </View>
            <OrderStatusCard order={activeOrder} />
          </>
        ) : (
          <View style={[styles.noOrder, { backgroundColor: colors.card }]}>
            <Feather name="map-pin" size={48} color={colors.mutedForeground} />
            <Text style={[styles.noOrderTitle, { color: colors.foreground }]}>No Active Order</Text>
            <Text style={[styles.noOrderSub, { color: colors.mutedForeground }]}>کوئی فعال آرڈر نہیں</Text>
            <Pressable onPress={() => router.push("/(tabs)/menu")} style={[styles.orderBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.orderBtnText}>Order Now</Text>
            </Pressable>
          </View>
        )}

        {orders.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order History</Text>
            {orders.filter(o => o.status === "delivered").map(order => (
              <View key={order.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyRestaurant, { color: colors.foreground }]}>{order.restaurant}</Text>
                  <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                    {new Date(order.createdAt).toLocaleDateString("en-PK")} / {order.items.length} items
                  </Text>
                  <Text style={[styles.historyPayment, { color: colors.mutedForeground }]}>
                    {order.paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} / Rs {order.total}
                  </Text>
                </View>
                <View style={[styles.deliveredBadge, { backgroundColor: colors.accent }]}>
                  <Feather name="check-circle" size={16} color={colors.primary} />
                  <Text style={[styles.deliveredText, { color: colors.primary }]}>Delivered</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { fontSize: theme.type.hero, fontFamily: theme.fonts.heading },
  subtitle: { fontSize: theme.type.sm, marginTop: 4 },
  activeBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm },
  activeBannerText: { color: "#fff", fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold, flex: 1, flexShrink: 1 },
  activeBannerSub: { color: "rgba(255,255,255,0.85)", fontSize: theme.type.xs, flexShrink: 0 },
  noOrder: { alignItems: "center", padding: 48, borderRadius: theme.radius.lg, gap: theme.spacing.sm },
  noOrderTitle: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium },
  noOrderSub: { fontSize: theme.type.sm },
  orderBtn: { paddingHorizontal: theme.spacing.xl, paddingVertical: 14, borderRadius: theme.radius.sm, marginTop: theme.spacing.xs },
  orderBtnText: { color: "#fff", fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold },
  sectionTitle: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  historyCard: { flexDirection: "row", alignItems: "center", padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 7, elevation: 1 },
  historyLeft: { flex: 1 },
  historyRestaurant: { fontSize: theme.type.sm, fontFamily: theme.fonts.headingMedium, flexShrink: 1 },
  historyDate: { fontSize: theme.type.xs, marginTop: 4, flexShrink: 1 },
  historyPayment: { fontSize: theme.type.xs, marginTop: 2, flexShrink: 1 },
  deliveredBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.pill, flexShrink: 0 },
  deliveredText: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold },
});
