import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AI_RESPONSES } from "@/data/chatData";

const URDU_COMMANDS = [
  "صحت مند کھانا بتائیں",
  "آج کی تجویز دیں",
  "ذیابطیس کے لیے کیا کھاؤں",
  "وزن کم کرنے کے لیے کھانا",
  "میرا آرڈر دکھائیں",
  "دل کی صحت کے لیے غذا",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function VoiceAssistant({ visible, onClose }: Props) {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [phase, setPhase] = useState<"idle" | "listening" | "processing" | "responding">("idle");
  const pulse = useRef(new Animated.Value(1)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(wave, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
      wave.setValue(0);
    }
  }, [isListening]);

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    setPhase("listening");
    setTranscript("");
    setResponse("");

    // Simulate listening for 2 seconds then pick random command
    setTimeout(() => {
      const cmd = URDU_COMMANDS[Math.floor(Math.random() * URDU_COMMANDS.length)];
      setTranscript(cmd);
      stopListening(cmd);
    }, 2500);
  };

  const stopListening = (cmd?: string) => {
    setIsListening(false);
    setPhase("processing");

    setTimeout(() => {
      const text = cmd || transcript;
      let reply = AI_RESPONSES.default;
      if (text.includes("ذیابطیس") || text.includes("شوگر")) reply = AI_RESPONSES.diabetes;
      else if (text.includes("وزن")) reply = AI_RESPONSES.weight;
      else if (text.includes("دل")) reply = AI_RESPONSES.heart;
      else if (text.includes("تجویز") || text.includes("آج")) reply = AI_RESPONSES.recommend;
      else reply = AI_RESPONSES.hello;
      setResponse(reply);
      setPhase("responding");
    }, 1000);
  };

  const handleCommandPress = (cmd: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranscript(cmd);
    setPhase("processing");
    setResponse("");
    setTimeout(() => {
      let reply = AI_RESPONSES.default;
      if (cmd.includes("ذیابطیس")) reply = AI_RESPONSES.diabetes;
      else if (cmd.includes("وزن")) reply = AI_RESPONSES.weight;
      else if (cmd.includes("دل")) reply = AI_RESPONSES.heart;
      else if (cmd.includes("تجویز") || cmd.includes("آج")) reply = AI_RESPONSES.recommend;
      setResponse(reply);
      setPhase("responding");
    }, 800);
  };

  const waveStyle = {
    transform: [{ scaleY: Animated.add(wave, new Animated.Value(0.3)) }],
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>AI Voice Assistant</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>اردو آواز مددگار</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.micArea}>
            <Animated.View style={[styles.micOuter, { borderColor: colors.primary, transform: [{ scale: pulse }] }]}>
              <Animated.View style={[styles.micMiddle, { backgroundColor: colors.accent }]}>
                <Pressable
                  onPress={handleMicPress}
                  style={[styles.micBtn, { backgroundColor: isListening ? "#EF4444" : colors.primary }]}
                >
                  <Feather name={isListening ? "square" : "mic"} size={32} color="#fff" />
                </Pressable>
              </Animated.View>
            </Animated.View>

            {isListening && (
              <View style={styles.waves}>
                {[0, 1, 2, 3, 4].map(i => (
                  <Animated.View
                    key={i}
                    style={[styles.wave, { backgroundColor: colors.primary, height: 12 + i * 6 + Math.random() * 10, ...waveStyle }]}
                  />
                ))}
              </View>
            )}

            <Text style={[styles.status, { color: colors.mutedForeground }]}>
              {phase === "idle" && "مائیک دبائیں"}
              {phase === "listening" && "سن رہا ہوں... 🎤"}
              {phase === "processing" && "سوچ رہا ہوں..."}
              {phase === "responding" && "جواب"}
            </Text>
          </View>

          {transcript ? (
            <View style={[styles.transcriptBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.transcriptLabel, { color: colors.mutedForeground }]}>آپ نے کہا:</Text>
              <Text style={[styles.transcript, { color: colors.foreground }]}>{transcript}</Text>
            </View>
          ) : null}

          {response ? (
            <View style={[styles.responseBox, { backgroundColor: colors.accent }]}>
              <Feather name="message-circle" size={16} color={colors.primary} />
              <Text style={[styles.response, { color: colors.foreground }]}>{response}</Text>
            </View>
          ) : null}

          <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>سوالات کی مثالیں:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {URDU_COMMANDS.map(cmd => (
              <Pressable
                key={cmd}
                onPress={() => handleCommandPress(cmd)}
                style={[styles.suggestion, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>{cmd}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  panel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, minHeight: 500 },
  handle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "700", flex: 1 },
  subtitle: { fontSize: 13 },
  closeBtn: { padding: 4 },
  micArea: { alignItems: "center", marginBottom: 24 },
  micOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  micMiddle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  micBtn: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  waves: { flexDirection: "row", gap: 4, marginTop: 16, alignItems: "center", height: 40 },
  wave: { width: 4, borderRadius: 2 },
  status: { marginTop: 12, fontSize: 14, fontWeight: "500" },
  transcriptBox: { padding: 14, borderRadius: 12, marginBottom: 12 },
  transcriptLabel: { fontSize: 11, marginBottom: 4 },
  transcript: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  responseBox: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, marginBottom: 16, alignItems: "flex-start" },
  response: { fontSize: 14, flex: 1, lineHeight: 22, textAlign: "right" },
  suggestLabel: { fontSize: 12, marginBottom: 8 },
  suggestions: { flexDirection: "row" },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  suggestionText: { fontSize: 12 },
});
