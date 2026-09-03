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

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { total } = useLocalSearchParams<{ total: string }>();
  const { items, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addPoints } = useAuth();
  const isWeb = Platform.OS === "web";
  const [method, setMethod] = useState<"easypaisa" | "jazzcash">("easypaisa");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    if (!phone || phone.length < 10) return;
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    await placeOrder(items, Number(total), method);
    clearCart();
    addPoints(Math.floor(Number(total) / 10));
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
          <Text style={styles.amount}>Rs {total}</Text>
          <Text style={styles.amountUrdu}>کل رقم</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Payment Method</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>ادائیگی کا طریقہ چنیں</Text>

        <PaymentMethodBtn type="easypaisa" logo="💚" name="EasyPaisa" color="#4CAF50" />
        <PaymentMethodBtn type="jazzcash" logo="🟠" name="JazzCash" color="#FF6B35" />

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
            backgroundColor: method === "easypaisa" ? "#4CAF50" : "#FF6B35",
            opacity: processing || !phone ? 0.7 : 1,
          }]}
          disabled={processing || !phone}
        >
          {processing ? <ActivityIndicator color="#fff" /> : (
            <>
              <Feather name="lock" size={20} color="#fff" />
              <Text style={styles.payText}>Pay Rs {total} via {method === "easypaisa" ? "EasyPaisa" : "JazzCash"}</Text>
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  titleUrdu: { fontSize: 14 },
  amountCard: { borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 28 },
  amountLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  amount: { color: "#fff", fontSize: 40, fontWeight: "900", marginTop: 8 },
  amountUrdu: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 14 },
  methodBtn: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 16, marginBottom: 12 },
  methodName: { fontSize: 16, fontWeight: "700" },
  methodSub: { fontSize: 12, marginTop: 2 },
  phoneBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  countryCode: { padding: 16, paddingRight: 14 },
  countryText: { fontSize: 15, fontWeight: "600" },
  phoneInput: { flex: 1, padding: 16, fontSize: 16 },
  secureBox: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, alignItems: "flex-start" },
  secureText: { fontSize: 13, flex: 1, lineHeight: 20 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 14, borderTopWidth: 1 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 16 },
  payText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  successCard: { margin: 40, borderRadius: 24, padding: 40, alignItems: "center" },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successUrdu: { fontSize: 16, marginTop: 6 },
  successSub: { fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
});
