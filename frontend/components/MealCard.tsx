import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Meal } from "@/data/meals";
import { useCart } from "@/context/CartContext";

interface MealCardProps {
  meal: Meal;
  compact?: boolean;
}

export function MealCard({ meal, compact = false }: MealCardProps) {
  const colors = useColors();
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.meal.id === meal.id);

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
          <Text style={[styles.compactName, { color: colors.foreground }]} numberOfLines={1}>{meal.name}</Text>
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
        <Text style={styles.badgeText}>Score: {meal.healthScore}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{meal.name}</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.mutedForeground }]}> {meal.rating}</Text>
          </View>
        </View>
        <Text style={[styles.nameUrdu, { color: colors.mutedForeground }]}>{meal.nameUrdu}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{meal.description}</Text>
        {meal.matchReason ? (
          <Text style={[styles.matchReason, { color: colors.primary }]} numberOfLines={2}>{meal.matchReason}</Text>
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
            <Text style={[styles.cal, { color: colors.mutedForeground }]}>{meal.calories} kcal · {meal.prepTime} min</Text>
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: "100%", height: 180, resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(46,125,50,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  info: { padding: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "700", flex: 1 },
  nameUrdu: { fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 12 },
  desc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  matchReason: { fontSize: 12, fontWeight: "600", marginTop: 6, lineHeight: 17 },
  tags: { flexDirection: "row", gap: 6, marginTop: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "600" },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  price: { fontSize: 18, fontWeight: "800" },
  cal: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25 },
  addText: { fontSize: 14, fontWeight: "700" },
  compactCard: { width: 150, borderRadius: 14, overflow: "hidden", marginRight: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  compactImage: { width: "100%", height: 100, resizeMode: "cover" },
  compactInfo: { padding: 10 },
  compactName: { fontSize: 13, fontWeight: "700" },
  compactCal: { fontSize: 11, marginTop: 2 },
  compactBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  addBtnSmall: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
