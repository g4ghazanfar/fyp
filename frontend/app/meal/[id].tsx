import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { getMeal, Meal } from "@/data/meals";
import { useCart } from "@/context/CartContext";

export default function MealDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, removeItem, items } = useCart();
  const isWeb = Platform.OS === "web";
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    if (id) getMeal(id).then(setMeal).catch(() => setMeal(null));
  }, [id]);

  if (!meal) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Meal not found</Text>
    </View>
  );

  const cartItem = items.find(i => i.meal.id === meal.id);

  const NutritionRow = ({ label, val, unit, color }: any) => (
    <View style={[styles.nutriRow, { backgroundColor: colors.card }]}>
      <Text style={[styles.nutriLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.nutriRight}>
        <Text style={[styles.nutriVal, { color }]}>{val}</Text>
        <Text style={[styles.nutriUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.imageContainer}>
           <Image source={typeof meal.image === "string" ? { uri: meal.image } : meal.image} style={styles.image} />
          <View style={[styles.overlay, { paddingTop: isWeb ? 67 : insets.top + 16 }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>Health Score: {meal.healthScore}/100</Text>
            </View>
          </View>
        </View>

        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{meal.name}</Text>
              <Text style={[styles.nameUrdu, { color: colors.mutedForeground }]}>{meal.nameUrdu}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color="#F59E0B" />
              <Text style={[styles.rating, { color: colors.foreground }]}> {meal.rating}</Text>
              <Text style={[styles.reviews, { color: colors.mutedForeground }]}> ({meal.reviews})</Text>
            </View>
          </View>

          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{meal.description}</Text>
          {meal.matchReason ? <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600", marginBottom: 14 }}>{meal.matchReason}</Text> : null}

          <View style={styles.infoRow}>
            <View style={[styles.infoChip, { backgroundColor: colors.muted }]}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{meal.prepTime} min</Text>
            </View>
            <View style={[styles.infoChip, { backgroundColor: colors.muted }]}>
              <Feather name="zap" size={14} color={colors.secondary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{meal.calories} kcal</Text>
            </View>
            <View style={[styles.infoChip, { backgroundColor: colors.muted }]}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>{meal.restaurant}</Text>
            </View>
          </View>

          <View style={styles.tags}>
            {meal.tags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.accent }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {meal.allergens.length > 0 && (
            <View style={[styles.allergenBox, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="alert-triangle" size={16} color="#D97706" />
              <Text style={{ color: "#D97706", flex: 1, fontSize: 13 }}>
                Contains: {meal.allergens.join(", ")}
              </Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredients</Text>
          <View style={styles.tags}>
            {meal.ingredients.map(ingredient => (
              <View key={ingredient} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.foreground }]}>{ingredient}</Text>
              </View>
            ))}
          </View>
          {meal.instructions ? <Text style={[styles.desc, { color: colors.mutedForeground }]}>{meal.instructions}</Text> : null}

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nutrition Facts</Text>
          <View style={styles.nutrition}>
            <NutritionRow label="Calories" val={meal.calories} unit="kcal" color={colors.secondary} />
            <NutritionRow label="Protein" val={meal.protein} unit="g" color={colors.primary} />
            <NutritionRow label="Carbohydrates" val={meal.carbs} unit="g" color="#F59E0B" />
            <NutritionRow label="Fat" val={meal.fat} unit="g" color="#EF4444" />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suitable For</Text>
          <View style={styles.tags}>
            {meal.suitableFor.map(s => (
              <View key={s} style={[styles.tag, { backgroundColor: "#D1FAE5" }]}>
                <Feather name="check" size={12} color="#10B981" />
                <Text style={[styles.tagText, { color: "#10B981" }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: isWeb ? 34 : insets.bottom + 8, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Price</Text>
          <Text style={[styles.price, { color: colors.primary }]}>Rs {meal.price}</Text>
        </View>
        <View style={styles.footerBtns}>
          {cartItem && (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeItem(meal.id); }} style={[styles.removeBtn, { backgroundColor: colors.destructive + "15" }]}>
              <Feather name="trash-2" size={20} color={colors.destructive} />
            </Pressable>
          )}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addItem(meal); }}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="shopping-cart" size={20} color="#fff" />
            <Text style={styles.addText}>{cartItem ? `Add More (${cartItem.quantity})` : "Add to Cart"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 280, resizeMode: "cover" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  scoreBadge: { backgroundColor: "rgba(46,125,50,0.9)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  body: { padding: 20 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: "800" },
  nameUrdu: { fontSize: 15, marginTop: 4 },
  ratingBadge: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "700" },
  reviews: { fontSize: 12 },
  desc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  infoText: { fontSize: 12, fontWeight: "600" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: "600" },
  allergenBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  nutrition: { gap: 8, marginBottom: 20 },
  nutriRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 12 },
  nutriLabel: { fontSize: 14 },
  nutriRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  nutriVal: { fontSize: 18, fontWeight: "800" },
  nutriUnit: { fontSize: 12 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 16, borderTopWidth: 1 },
  priceLabel: { fontSize: 12 },
  price: { fontSize: 26, fontWeight: "800" },
  footerBtns: { flexDirection: "row", gap: 10, alignItems: "center" },
  removeBtn: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  addText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
