import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/onboarding");
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
