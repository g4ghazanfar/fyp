import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, HealthProfile } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { theme } from "@/constants/theme";

const STEPS = ["Personal Info", "Health Profile", "Preferences"];

const CONDITIONS = ["Diabetes", "Heart Disease", "Hypertension", "None"];
const ALLERGIES = ["Peanuts", "Gluten", "Dairy", "Eggs", "Fish", "None"];
const PREFS = ["Vegetarian", "Vegan", "High Protein", "Low Carb", "Keto", "No Preference"];
const GOALS = ["Weight Loss", "Weight Gain", "Maintain Weight", "Muscle Building", "Heart Health", "Diabetes Control"];

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  age: string;
  weight: string;
  height: string;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  bloodType: string;
  allergies: string[];
  conditions: string[];
  dietaryPrefs: string[];
  fitnessGoal: string;
}

export default function Register() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", address: "", password: "",
    age: "", weight: "", height: "", gender: "male", activityLevel: "moderate", bloodType: "O+",
    allergies: [], conditions: [], dietaryPrefs: [], fitnessGoal: "Maintain Weight",
  });

  const toggle = (arr: string[], val: string, key: keyof FormData) => {
    const current = form[key] as string[];
    const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    setForm({ ...form, [key]: updated });
  };

  const MultiSelect = ({ options, field }: { options: string[]; field: keyof FormData }) => (
    <View style={styles.chips}>
      {options.map(opt => {
        const selected = (form[field] as string[]).includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => toggle(form[field] as string[], opt, field)}
            style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.input, borderColor: selected ? colors.primary : colors.border }]}
          >
            <Text style={[styles.chipText, { color: selected ? "#fff" : colors.foreground }]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const SingleSelect = ({ options, field }: { options: string[]; field: keyof FormData }) => (
    <View style={styles.chips}>
      {options.map(opt => {
        const selected = form[field] === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => setForm({ ...form, [field]: opt })}
            style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.input, borderColor: selected ? colors.primary : colors.border }]}
          >
            <Text style={[styles.chipText, { color: selected ? "#fff" : colors.foreground }]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const Input = ({ label, placeholder, field, keyboardType = "default", secure = false }: any) => (
    <View style={styles.fieldBox}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={form[field as keyof FormData] as string}
          onChangeText={v => setForm({ ...form, [field]: v })}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const handleSubmit = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const hp: HealthProfile = {
      age: Number(form.age) || 25,
      weight: Number(form.weight) || 65,
      height: Number(form.height) || 170,
      gender: form.gender,
      activityLevel: form.activityLevel,
      bloodType: form.bloodType,
      allergies: form.allergies,
      conditions: form.conditions,
      dietaryPrefs: form.dietaryPrefs,
      fitnessGoal: form.fitnessGoal,
    };
    const success = await register({
      name: form.name || "New User",
      email: form.email || "user@example.com",
      phone: form.phone || "0300-0000000",
      address: form.address || "Lahore, Pakistan",
      healthProfile: hp,
    }, form.password);
    setLoading(false);
    if (success) router.replace("/(tabs)/home");
    else setError("Could not create your account. Check your details and try again.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card }]}>
        <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Part {step + 1} of {STEPS.length} / {STEPS[step]}</Text>
        </View>
      </View>

      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progressBar, { backgroundColor: i <= step ? colors.primary : colors.border, flex: 1 }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal Information</Text>
            <Input label="Full Name" placeholder="Enter your name" field="name" />
            <Input label="Email" placeholder="email@example.com" field="email" keyboardType="email-address" />
            <Input label="Phone Number" placeholder="0300-0000000" field="phone" keyboardType="phone-pad" />
            <Input label="Address" placeholder="City, Area" field="address" />
            <Input label="Password" placeholder="Create password" field="password" secure />
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Health Profile</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="Age" placeholder="22" field="age" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Weight (kg)" placeholder="65" field="weight" keyboardType="numeric" />
              </View>
            </View>
            <Input label="Height (cm)" placeholder="170" field="height" keyboardType="numeric" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Gender</Text>
            <SingleSelect options={["male", "female"]} field="gender" />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Activity Level</Text>
            <SingleSelect options={["sedentary", "light", "moderate", "active"]} field="activityLevel" />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Blood Type</Text>
            <SingleSelect options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} field="bloodType" />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Medical Conditions</Text>
            <MultiSelect options={CONDITIONS} field="conditions" />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Allergies</Text>
            <MultiSelect options={ALLERGIES} field="allergies" />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Food Preferences</Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Dietary Preferences</Text>
            <MultiSelect options={PREFS} field="dietaryPrefs" />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 16 }]}>Fitness Goal</Text>
            <SingleSelect options={GOALS} field="fitnessGoal" />
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={() => step < STEPS.length - 1 ? setStep(step + 1) : handleSubmit()}
          style={[styles.nextBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.nextText}>{step < STEPS.length - 1 ? "Next Step" : "Create Account"}</Text>
              <Feather name={step < STEPS.length - 1 ? "arrow-right" : "check"} size={20} color="#fff" />
            </>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace("/login")} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
            Have an account? <Text style={{ color: colors.primary, fontWeight: "700" }}>Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, gap: theme.spacing.sm },
  back: { padding: 4 },
  title: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium },
  subtitle: { fontSize: theme.type.xs, marginTop: 4 },
  progress: { flexDirection: "row", gap: theme.spacing.xxs, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xs },
  progressBar: { height: 3, borderRadius: 2 },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  section: { gap: theme.spacing.sm },
  sectionTitle: { fontSize: theme.type.heading, fontFamily: theme.fonts.headingMedium, marginBottom: theme.spacing.xs },
  fieldBox: { gap: theme.spacing.xs },
  label: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodyMedium },
  inputBox: { borderRadius: theme.radius.sm, padding: theme.spacing.sm, borderWidth: 1 },
  input: { fontSize: theme.type.sm, minWidth: 0 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  chip: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.pill, borderWidth: 1.5, flexShrink: 0 },
  chipText: { fontSize: theme.type.xs, fontFamily: theme.fonts.bodySemibold, flexShrink: 0 },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: theme.radius.md, marginTop: theme.spacing.lg },
  nextText: { color: "#fff", fontSize: theme.type.body, fontFamily: theme.fonts.bodyBold },
  loginLink: { alignItems: "center", marginTop: theme.spacing.md },
  loginText: { fontSize: theme.type.sm },
  error: { color: theme.colors.error, fontSize: theme.type.xs, textAlign: "center", marginTop: theme.spacing.sm },
});
