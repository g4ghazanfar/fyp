import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Meal } from "@/data/meals";
import { useCart } from "@/context/CartContext";
import { theme } from "@/constants/theme";

interface MealCardProps {
  meal: Meal;
  compact?: boolean;
}

export function MealCard({ meal, compact = false }: MealCardProps) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.meal.id === meal.id);
  const healthScore = Number.isFinite(Number(meal.healthScore)) ? Number(meal.healthScore) : 0;
  const description = (meal.description || "").replace(/\s+/g, " ").trim();
  const categoryDescription = (meal.tags?.[0] || meal.category || "SmartEats meal").replace(/^\w/, character => character.toUpperCase());
  const isInstructionText = /(?:^|\b)(?:step\s*\d|instructions?|cook|add|heat|boil|fry|mix|bake)\b/i.test(description);
  const cardDescription = isInstructionText
    ? categoryDescription
    : description.length > 57 ? `${description.slice(0, 57).trimEnd()}...` : description || categoryDescription;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(meal);
  };

  if (compact) {
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/meal/[id]", params: { id: meal.id } })}
        style={({ pressed }) => [styles.compactCard, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
      >
        <Image source={typeof meal.image === "string" ? { uri: meal.image } : meal.image} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: colors.foreground }]}>{meal.name}</Text>
          <Text style={[styles.compactCal, { color: colors.mutedForeground }]}>{meal.calories} kcal</Text>
          <View style={styles.compactBottom}>
            <Text style={[styles.price, { color: colors.primary }]}>Rs {meal.price}</Text>
            <Pressable onPress={handleAdd} style={[styles.addBtnSmall, { backgroundColor: inCart ? colors.accent : colors.primary }]}>
              <Feather name="plus" size={14} color={inCart ? colors.primary : "#fff"} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/meal/[id]", params: { id: meal.id } })}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, opacity: pressed ? 0.95 : 1 }]}
    >
      <Image source={typeof meal.image === "string" ? { uri: meal.image } : meal.image} style={styles.image} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Score: {healthScore}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
           <Text style={[styles.name, { color: colors.foreground }]}>{meal.name}</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.mutedForeground }]}> {meal.rating}</Text>
          </View>
        </View>
        <Text style={[styles.nameUrdu, { color: colors.mutedForeground }]}>{meal.nameUrdu}</Text>
         <Text style={[styles.desc, { color: colors.mutedForeground }]}>{cardDescription}</Text>
        {meal.matchReason ? (
          <Text style={[styles.matchReason, { color: colors.primary }]}>{meal.matchReason}</Text>
        ) : null}
        <View style={styles.tags}>
          {meal.tags.slice(0, 2).map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.bottom}>
          <View>
            <Text style={[styles.price, { color: colors.primary }]}>Rs {meal.price}</Text>
            <Text style={[styles.cal, { color: colors.mutedForeground }]}>{meal.calories} kcal / {meal.prepTime} min</Text>
          </View>
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, { backgroundColor: inCart ? colors.accent : colors.primary }]}
          >
            <Feather name="shopping-cart" size={16} color={inCart ? colors.primary : "#fff"} />
            <Text style={[styles.addText, { color: inCart ? colors.primary : "#fff" }]}>
              {inCart ? `(${inCart.quantity})` : "Add"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  image: { width: "100%", height: 192, resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: theme.colors.health,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: theme.type.xs, fontFamily: theme.fonts.bodyBold },
  info: { padding: theme.spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.sm },
  name: { fontSize: theme.type.body, fontFamily: theme.fonts.headingMedium, flex: 1, flexShrink: 1, lineHeight: 22 },
  nameUrdu: { fontSize: theme.type.sm, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodyMedium },
  desc: { fontSize: theme.type.sm, marginTop: 8, lineHeight: 20 },
  matchReason: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold, marginTop: 8, lineHeight: 17 },
  tags: { flexDirection: "row", gap: theme.spacing.xs, marginTop: theme.spacing.sm, flexWrap: "wrap" },
  tag: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xxs, borderRadius: theme.radius.pill },
  tagText: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.sm, marginTop: theme.spacing.md },
  price: { fontSize: 18, fontFamily: theme.fonts.headingMedium },
  cal: { fontSize: theme.type.xs, marginTop: 4 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: theme.spacing.md, paddingVertical: 10, borderRadius: theme.radius.pill },
  addText: { fontSize: theme.type.sm, fontFamily: theme.fonts.bodyBold },
  compactCard: { width: 164, borderRadius: theme.radius.md, overflow: "hidden", marginRight: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  compactImage: { width: "100%", height: 100, resizeMode: "cover" },
  compactInfo: { padding: theme.spacing.sm, minHeight: 126 },
  compactName: { fontSize: theme.type.sm, fontFamily: theme.fonts.headingMedium, lineHeight: 18 },
  compactCal: { fontSize: theme.type.xs, marginTop: 4 },
  compactBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  addBtnSmall: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
