import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { getMeals, Meal, CATEGORIES } from "@/data/meals";
import { MealCard } from "@/components/MealCard";
import { useCart } from "@/context/CartContext";

export default function MenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, total, itemCount } = useCart();
  const isWeb = Platform.OS === "web";
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"health" | "price" | "rating">("health");
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    getMeals().then(setMeals).catch(() => setMeals([]));
  }, []);

  const filtered = [...meals]
    .filter(m => activeCategory === "All" || m.category === activeCategory.toLowerCase())
    .sort((a, b) => {
      if (sortBy === "health") return b.healthScore - a.healthScore;
      if (sortBy === "price") return a.price - b.price;
      return b.rating - a.rating;
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Menu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortContent}>
          {(["health", "price", "rating"] as const).map(s => (
            <Pressable
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.sortBtn, { backgroundColor: sortBy === s ? colors.primary : colors.input }]}
            >
              <Text style={[styles.sortText, { color: sortBy === s ? "#fff" : colors.mutedForeground }]}>
                {s === "health" ? "Healthy" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categories, { borderBottomColor: colors.border }]} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveCategory(cat); }}
            style={[styles.catBtn, { backgroundColor: activeCategory === cat ? colors.primary : colors.input }]}
          >
            <Text style={[styles.catText, { color: activeCategory === cat ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{filtered.length} meals</Text>
        {filtered.map(m => <MealCard key={m.id} meal={m} />)}
      </ScrollView>

      {itemCount > 0 && (
        <Pressable
          onPress={() => router.push("/cart")}
          style={[styles.cartBtn, { backgroundColor: colors.primary }]}
        >
          <View style={[styles.cartBadge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartBtnText}>View Cart — Rs {total}</Text>
          <Feather name="shopping-cart" size={20} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "800" },
  sortRow: { marginTop: 12 },
  sortContent: { flexDirection: "row", gap: 8, paddingRight: 4 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, flexShrink: 0 },
  sortText: { fontSize: 12, fontWeight: "600", flexShrink: 0 },
  categories: { borderBottomWidth: 1, paddingVertical: 12 },
  categoriesContent: { paddingHorizontal: 16, alignItems: "center" },
  catBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 8, flexShrink: 0 },
  catText: { fontSize: 14, fontWeight: "600", flexShrink: 0 },
  count: { fontSize: 13, marginBottom: 12 },
  cartBtn: { position: "absolute", bottom: 84, left: 20, right: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1, flexShrink: 1, textAlign: "center" },
  cartBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
