import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const isWeb = Platform.OS === "web";
  const deliveryFee = 50;
  const subtotal = Number.isFinite(total) ? total : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Cart</Text>
        {items.length > 0 && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearCart(); }}>
            <Text style={[styles.clearText, { color: colors.destructive }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="shopping-cart" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Cart is Empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>کارٹ خالی ہے</Text>
          <Pressable onPress={() => router.push("/(tabs)/menu")} style={[styles.shopBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.shopBtnText}>Browse Menu</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 200 }}>
            {items.map(item => (
              <View key={item.meal.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
                <Image source={typeof item.meal.image === "string" ? { uri: item.meal.image } : item.meal.image} style={styles.itemImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.meal.name}</Text>
                  <Text style={[styles.itemNameUrdu, { color: colors.mutedForeground }]}>{item.meal.nameUrdu}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>Rs {item.meal.price}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.meal.id, item.quantity - 1); }}
                    style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                  >
                    <Feather name="minus" size={16} color={colors.foreground} />
                  </Pressable>
                  <Text style={[styles.qty, { color: colors.foreground }]}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.meal.id, item.quantity + 1); }}
                    style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  >
                    <Feather name="plus" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}

            <View style={[styles.summary, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>Rs {subtotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Delivery Fee</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>Rs {deliveryFee}</Text>
              </View>
              <View style={[styles.summaryRow, { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.foreground, fontWeight: "700", fontSize: 16 }]}>Total</Text>
                <Text style={[styles.summaryVal, { color: colors.primary, fontWeight: "800", fontSize: 18 }]}>Rs {grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: isWeb ? 34 : insets.bottom + 8, borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push({ pathname: "/payment", params: { total: String(grandTotal) } })}
              style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.checkoutText}>Proceed to Payment</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  clearText: { fontSize: 14, fontWeight: "600", flexShrink: 0 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySub: { fontSize: 14 },
  shopBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  shopBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  itemCard: { flexDirection: "row", gap: 14, padding: 14, borderRadius: 14, marginBottom: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  itemImage: { width: 64, height: 64, borderRadius: 12, resizeMode: "cover" },
  itemName: { fontSize: 14, fontWeight: "700" },
  itemNameUrdu: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 16, fontWeight: "700", minWidth: 20, textAlign: "center" },
  summary: { borderRadius: 16, padding: 20, marginTop: 8, gap: 12 },
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryVal: { fontSize: 14, fontWeight: "600" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 14, borderTopWidth: 1 },
  checkoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 16 },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700", flexShrink: 1, textAlign: "center" },
});
