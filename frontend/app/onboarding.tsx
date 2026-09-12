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
import { theme } from "@/constants/theme";

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
    color: theme.colors.health,
  },
  {
    title: "Health First",
    titleUrdu: "صحت پہلے",
    subtitle: "AI Meal Recommendations",
    subtitleUrdu: "ذہین کھانے کی تجاویز",
    desc: "Our AI analyzes your allergies, conditions and preferences to suggest the safest, healthiest meals.",
    descUrdu: "ہمارا AI آپ کی الرجی، بیماریاں اور پسند دیکھ کر محفوظ اور صحت مند کھانے بتاتا ہے۔",
    icon: "activity",
    color: theme.colors.primary,
  },
  {
    title: "Easy Payment",
    titleUrdu: "آسان ادائیگی",
    subtitle: "EasyPaisa & JazzCash",
    subtitleUrdu: "ایزی پیسہ اور جاز کیش",
    desc: "Pay securely with Pakistan's most trusted mobile payment platforms.",
    descUrdu: "پاکستان کے سب سے معتبر موبائل ادائیگی پلیٹ فارم سے محفوظ ادائیگی کریں۔",
    icon: "credit-card",
    color: theme.colors.secondary,
  },
  {
    title: "AI Voice Assistant",
    titleUrdu: "اردو آواز مددگار",
    subtitle: "Talk in Urdu",
    subtitleUrdu: "اردو میں بات کریں",
    desc: "Order food, get health advice and track orders — all by speaking in Urdu.",
    descUrdu: "کھانا آرڈر کریں، صحت کی مشورہ لیں اور آرڈر ٹریک کریں — سب اردو میں بول کر۔",
    icon: "mic",
    color: theme.colors.info,
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
  hero: { height: "45%", alignItems: "center", justifyContent: "center", gap: theme.spacing.md },
  iconCircle: { width: 128, height: 128, borderRadius: 64, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.36)" },
  heroTitle: { fontSize: theme.type.hero, fontFamily: theme.fonts.heading, color: "#fff", letterSpacing: -0.5 },
  heroTitleUrdu: { fontSize: theme.type.body, color: "rgba(255,255,255,0.85)", fontFamily: theme.fonts.bodyMedium },
  content: { flex: 1, padding: theme.spacing.xl, justifyContent: "center" },
  dots: { flexDirection: "row", gap: theme.spacing.xs, marginBottom: theme.spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  subtitle: { fontSize: theme.type.display, fontFamily: theme.fonts.heading, marginBottom: 4 },
  subtitleUrdu: { fontSize: theme.type.sm, marginBottom: theme.spacing.md },
  desc: { fontSize: theme.type.body, lineHeight: 24, marginBottom: theme.spacing.xs },
  descUrdu: { fontSize: theme.type.sm, lineHeight: 22, textAlign: "right" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: theme.radius.md, marginTop: theme.spacing.xl },
  btnText: { color: "#fff", fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold },
  loginLink: { alignItems: "center", marginTop: theme.spacing.md },
  loginText: { fontSize: theme.type.sm },
});
