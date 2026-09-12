import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { total: totalParam } = useLocalSearchParams<{ total?: string | string[] }>();
  const { items, total: cartSubtotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addPoints } = useAuth();
  const isWeb = Platform.OS === "web";
  const [method, setMethod] = useState<"easypaisa" | "jazzcash">("easypaisa");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const parsedRouteTotal = Number(Array.isArray(totalParam) ? totalParam[0] : totalParam);
  const fallbackTotal = (Number.isFinite(cartSubtotal) ? cartSubtotal : 0) + 50;
  const payableTotal = Number.isFinite(parsedRouteTotal) && parsedRouteTotal > 0 ? parsedRouteTotal : fallbackTotal;
  const formattedTotal = payableTotal.toLocaleString();

  const handlePay = async () => {
    if (!phone || phone.length < 10) return;
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    await placeOrder(items, payableTotal, method);
    clearCart();
    addPoints(Math.floor(payableTotal / 10));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      router.replace("/(tabs)/track");
    }, 2500);
  };

  const PaymentMethodBtn = ({ type, logo, name, color }: { type: "easypaisa" | "jazzcash"; logo: string; name: string; color: string }) => (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMethod(type); }}
      style={[styles.methodBtn, {
        borderColor: method === type ? color : colors.border,
        borderWidth: method === type ? 2 : 1,
        backgroundColor: method === type ? color + "10" : colors.card,
      }]}
    >
      <Text style={{ fontSize: 28 }}>{logo}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.methodName, { color: colors.foreground }]}>{name}</Text>
        <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>Mobile Payment</Text>
      </View>
      {method === type && <Feather name="check-circle" size={22} color={color} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Payment</Text>
        <Text style={[styles.titleUrdu, { color: colors.mutedForeground }]}>ادائیگی</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <View style={[styles.amountCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>Rs {formattedTotal}</Text>
          <Text style={styles.amountUrdu}>کل رقم</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Payment Method</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>ادائیگی کا طریقہ چنیں</Text>

        <PaymentMethodBtn type="easypaisa" logo="💚" name="EasyPaisa" color={colors.health} />
        <PaymentMethodBtn type="jazzcash" logo="🟠" name="JazzCash" color={colors.secondary} />

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Mobile Number</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>موبائل نمبر</Text>

        <View style={[styles.phoneBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.countryCode, { backgroundColor: colors.muted }]}>
            <Text style={[styles.countryText, { color: colors.foreground }]}>🇵🇰 +92</Text>
          </View>
          <TextInput
            style={[styles.phoneInput, { color: colors.foreground }]}
            placeholder="3XX-XXXXXXX"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <View style={[styles.secureBox, { backgroundColor: colors.accent }]}>
          <Feather name="shield" size={16} color={colors.primary} />
          <Text style={[styles.secureText, { color: colors.primary }]}>
            Secure payment via {method === "easypaisa" ? "EasyPaisa" : "JazzCash"}. You will receive a PIN on your mobile.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: isWeb ? 34 : insets.bottom + 8, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handlePay}
          style={[styles.payBtn, {
             backgroundColor: method === "easypaisa" ? colors.health : colors.secondary,
            opacity: processing || !phone ? 0.7 : 1,
          }]}
          disabled={processing || !phone}
        >
          {processing ? <ActivityIndicator color="#fff" /> : (
            <>
              <Feather name="lock" size={20} color="#fff" />
              <Text style={styles.payText}>Pay Rs {formattedTotal} via {method === "easypaisa" ? "EasyPaisa" : "JazzCash"}</Text>
            </>
          )}
        </Pressable>
      </View>

      <Modal visible={success} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="check-circle" size={56} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
            <Text style={[styles.successUrdu, { color: colors.primary }]}>ادائیگی کامیاب ہو گئی!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Your order has been placed. Track it in real-time.</Text>
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  title: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, flexShrink: 1 },
  titleUrdu: { fontSize: theme.type.sm },
  amountCard: { borderRadius: theme.radius.lg, padding: 28, alignItems: "center", marginBottom: theme.spacing.lg },
  amountLabel: { color: "rgba(42,33,28,0.68)", fontSize: theme.type.sm },
  amount: { color: theme.colors.inkOnPrimary, fontSize: 40, fontFamily: theme.fonts.heading, marginTop: theme.spacing.xs },
  amountUrdu: { color: "rgba(42,33,28,0.62)", fontSize: theme.type.sm, marginTop: 6 },
  sectionTitle: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, marginBottom: 4 },
  sectionSub: { fontSize: theme.type.xs, marginBottom: theme.spacing.sm },
  methodBtn: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm },
  methodName: { fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold },
  methodSub: { fontSize: theme.type.xs, marginTop: 2 },
  phoneBox: { flexDirection: "row", alignItems: "center", borderRadius: theme.radius.sm, borderWidth: 1, overflow: "hidden", marginBottom: theme.spacing.md },
  countryCode: { padding: 16, paddingRight: 14 },
  countryText: { fontSize: 15, fontWeight: "600" },
  phoneInput: { flex: 1, padding: 16, fontSize: 16 },
  secureBox: { flexDirection: "row", gap: 10, padding: theme.spacing.sm, borderRadius: theme.radius.sm, alignItems: "flex-start" },
  secureText: { fontSize: theme.type.sm, flex: 1, lineHeight: 20 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: theme.spacing.lg, paddingTop: theme.spacing.sm, borderTopWidth: 1 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: theme.radius.md },
  payText: { color: "#fff", fontSize: theme.type.sm, fontFamily: theme.fonts.bodyBold, flexShrink: 1, textAlign: "center" },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  successCard: { margin: 40, borderRadius: 24, padding: 40, alignItems: "center" },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: theme.type.display, fontFamily: theme.fonts.heading },
  successUrdu: { fontSize: theme.type.body, marginTop: 6 },
  successSub: { fontSize: theme.type.sm, marginTop: theme.spacing.xs, textAlign: "center", lineHeight: 20 },
});
