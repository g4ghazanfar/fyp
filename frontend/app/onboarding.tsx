import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "SmartEats",
    titleUrdu: "سمارٹ ایٹس",
    subtitle: "AI-Powered Health Food Delivery",
    subtitleUrdu: "ذہین صحت مند کھانا ڈیلیوری",
    desc: "Personalized meal recommendations based on your health profile. Eat right, live better.",
    descUrdu: "آپ کی صحت کے مطابق کھانے کی تجاویز۔ صحیح کھائیں، بہتر جئیں۔",
    icon: "heart",
    color: "#2E7D32",
  },
  {
    title: "Health First",
    titleUrdu: "صحت پہلے",
    subtitle: "AI Meal Recommendations",
    subtitleUrdu: "ذہین کھانے کی تجاویز",
    desc: "Our AI analyzes your allergies, conditions and preferences to suggest the safest, healthiest meals.",
    descUrdu: "ہمارا AI آپ کی الرجی، بیماریاں اور پسند دیکھ کر محفوظ اور صحت مند کھانے بتاتا ہے۔",
    icon: "activity",
    color: "#FF6B35",
  },
  {
    title: "Easy Payment",
    titleUrdu: "آسان ادائیگی",
    subtitle: "EasyPaisa & JazzCash",
    subtitleUrdu: "ایزی پیسہ اور جاز کیش",
    desc: "Pay securely with Pakistan's most trusted mobile payment platforms.",
    descUrdu: "پاکستان کے سب سے معتبر موبائل ادائیگی پلیٹ فارم سے محفوظ ادائیگی کریں۔",
    icon: "credit-card",
    color: "#8B5CF6",
  },
  {
    title: "AI Voice Assistant",
    titleUrdu: "اردو آواز مددگار",
    subtitle: "Talk in Urdu",
    subtitleUrdu: "اردو میں بات کریں",
    desc: "Order food, get health advice and track orders — all by speaking in Urdu.",
    descUrdu: "کھانا آرڈر کریں، صحت کی مشورہ لیں اور آرڈر ٹریک کریں — سب اردو میں بول کر۔",
    icon: "mic",
    color: "#3B82F6",
  },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      router.replace("/register");
    }
  };

  const slide = SLIDES[current];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.hero, { backgroundColor: slide.color }]}>
        <View style={[styles.iconCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name={slide.icon as any} size={64} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>{slide.title}</Text>
        <Text style={styles.heroTitleUrdu}>{slide.titleUrdu}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, {
                backgroundColor: i === current ? slide.color : colors.border,
                width: i === current ? 24 : 8,
              }]}
            />
          ))}
        </View>

        <Text style={[styles.subtitle, { color: slide.color }]}>{slide.subtitle}</Text>
        <Text style={[styles.subtitleUrdu, { color: colors.mutedForeground }]}>{slide.subtitleUrdu}</Text>
        <Text style={[styles.desc, { color: colors.foreground }]}>{slide.desc}</Text>
        <Text style={[styles.descUrdu, { color: colors.mutedForeground }]}>{slide.descUrdu}</Text>

        <Pressable
          onPress={next}
          style={[styles.btn, { backgroundColor: slide.color }]}
        >
          <Text style={styles.btnText}>
            {current < SLIDES.length - 1 ? "Next" : "Get Started"}
          </Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>

        {current > 0 && (
          <Pressable onPress={() => router.replace("/login")} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
              Already have an account? <Text style={{ color: slide.color, fontWeight: "700" }}>Login</Text>
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { height: "45%", alignItems: "center", justifyContent: "center", gap: 16 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 32, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  heroTitleUrdu: { fontSize: 20, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
  content: { flex: 1, padding: 32, justifyContent: "center" },
  dots: { flexDirection: "row", gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  subtitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitleUrdu: { fontSize: 15, marginBottom: 16 },
  desc: { fontSize: 15, lineHeight: 24, marginBottom: 8 },
  descUrdu: { fontSize: 14, lineHeight: 22, textAlign: "right" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 16, marginTop: 32 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  loginLink: { alignItems: "center", marginTop: 16 },
  loginText: { fontSize: 14 },
});
