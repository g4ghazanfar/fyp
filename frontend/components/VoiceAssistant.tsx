import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system/legacy";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { apiRequest, API_BASE_URL } from "@/data/api";
import { useAuth } from "@/context/AuthContext";

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

type Phase = "idle" | "listening" | "transcribing" | "processing" | "responding";

// Har recording session ke liye bilkul naya native recorder banata hai.
// Android ka recorder dusri dafa reuse karne pe crash karta hai, isliye
// stop hone ke baad "sessionId" badal ke ye component dobara mount hota hai.
function RecorderBridge({ onReady }: { onReady: (recorder: ReturnType<typeof useAudioRecorder>) => void }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  useEffect(() => {
    onReady(recorder);
  }, [recorder]);
  return null;
}

export function VoiceAssistant({ visible, onClose }: Props) {
  const colors = useColors();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const recorderRef = useRef<ReturnType<typeof useAudioRecorder> | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const pulse = useRef(new Animated.Value(1)).current;
  const wave = useRef(new Animated.Value(0)).current;

  // Modal khulte hi SABSE PEHLE permission le kar audio mode set karo —
  // recorder tab tak bilkul mount hi nahi hoga jab tak ye complete na ho jaye.
  useEffect(() => {
    if (!visible) {
      setAudioReady(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        if (!cancelled) setError("مائیکروفون کی permission allow کریں۔");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      if (!cancelled) setAudioReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const speakResponse = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: /[\u0600-\u06ff]/.test(text) ? "ur-PK" : "en-US",
      rate: 0.9,
      pitch: 1,
    });
  };

  const submitPrompt = async (text: string) => {
    const prompt = text.trim();
    if (!prompt) {
      setPhase("idle");
      return;
    }
    setTranscript(prompt);
    setResponse("");
    setError("");
    setPhase("processing");
    try {
      const result = await apiRequest<{ reply: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: prompt, healthProfile: user?.healthProfile || {} }),
      });
      const reply = result.reply?.trim() || "معذرت، مجھے ابھی جواب نہیں ملا۔";
      setResponse(reply);
      setPhase("responding");
      speakResponse(reply);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "AI service unavailable";
      setError(message.includes("AI service") ? "Gemini AI ابھی configured نہیں ہے۔" : "کنکشن کا مسئلہ ہے، دوبارہ کوشش کریں۔");
      setPhase("idle");
    }
  };

  const transcribeAndSubmit = async (uri: string) => {
    setPhase("transcribing");
    setError("");
    try {
      const token = await AsyncStorage.getItem("smarteats_token");
      const uploadResult = await FileSystem.uploadAsync(
        `${API_BASE_URL}/ai/transcribe`,
        uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "audio",
          mimeType: "audio/m4a",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (uploadResult.status !== 200) {
        console.error("TRANSCRIBE UPLOAD FAILED:", uploadResult.status, uploadResult.body);
        setError("آواز کو text میں تبدیل کرنے میں مسئلہ ہوا۔");
        setPhase("idle");
        return;
      }

      const data = JSON.parse(uploadResult.body);
      const text = data.text?.trim();
      if (!text) {
        setError("آواز واضح نہیں تھی، دوبارہ کوشش کریں۔");
        setPhase("idle");
        return;
      }
      await submitPrompt(text);
    } catch (transcribeError) {
      console.error("TRANSCRIBE ERROR:", transcribeError);
      setError("آواز کو text میں تبدیل کرنے میں مسئلہ ہوا۔");
      setPhase("idle");
    }
  };

  useEffect(() => {
    if (isListening) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])).start();
    } else {
      pulse.stopAnimation();
      wave.stopAnimation();
      pulse.setValue(1);
      wave.setValue(0);
    }
  }, [isListening, pulse, wave]);

  useEffect(() => () => {
    Speech.stop();
  }, []);

  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Speech.stop();
    if (!audioReady) {
      setError("مائیکروفون ابھی تیار نہیں، دوبارہ کوشش کریں۔");
      return;
    }
    setTranscript("");
    setResponse("");
    setError("");
    setPhase("listening");
    setIsListening(true);

    await new Promise(resolve => setTimeout(resolve, 150));
    const recorder = recorderRef.current;
    if (!recorder) {
      setError("Recorder تیار نہیں ہوا، دوبارہ کوشش کریں۔");
      setIsListening(false);
      setPhase("idle");
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (recordError) {
      console.error("RECORD START ERROR:", recordError);
      setError("ریکارڈنگ شروع نہیں ہو سکی، دوبارہ کوشش کریں۔");
      setIsListening(false);
      setPhase("idle");
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    const recorder = recorderRef.current;
    if (!recorder) {
      setPhase("idle");
      return;
    }
    try {
      await recorder.stop();
      const uri = recorder.uri;
      setSessionId(id => id + 1);
      if (uri) {
        await transcribeAndSubmit(uri);
      } else {
        setError("Recording save نہیں ہو سکی، دوبارہ کوشش کریں۔");
        setPhase("idle");
      }
    } catch (stopError) {
      console.error("RECORD STOP ERROR:", stopError);
      setSessionId(id => id + 1);
      setError("ریکارڈنگ روکنے میں مسئلہ ہوا، دوبارہ کوشش کریں۔");
      setPhase("idle");
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCommandPress = (command: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    submitPrompt(command);
  };

  const handleClose = () => {
    if (isListening && recorderRef.current) {
      recorderRef.current.stop().catch(() => {});
      setSessionId(id => id + 1);
    }
    Speech.stop();
    setIsListening(false);
    setPhase("idle");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      {audioReady && <RecorderBridge key={sessionId} onReady={r => { recorderRef.current = r; }} />}
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.foreground }]}>AI Voice Assistant</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>اردو میں بولیں، جواب سنیں</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.micArea}>
            <Animated.View style={[styles.micOuter, { borderColor: colors.primary, transform: [{ scale: pulse }] }]}>
              <Animated.View style={[styles.micMiddle, { backgroundColor: colors.accent }]}>
                <Pressable
                  onPress={handleMicPress}
                  disabled={phase === "transcribing" || phase === "processing" || !audioReady}
                  style={[styles.micBtn, { backgroundColor: isListening ? "#EF4444" : colors.primary, opacity: (phase === "transcribing" || phase === "processing" || !audioReady) ? 0.6 : 1 }]}
                >
                  <Feather name={isListening ? "square" : "mic"} size={32} color="#fff" />
                </Pressable>
              </Animated.View>
            </Animated.View>
            {isListening && (
              <View style={styles.waves}>
                {[18, 30, 22, 36, 26].map((height, index) => (
                  <Animated.View key={index} style={[styles.wave, { backgroundColor: colors.primary, height, transform: [{ scaleY: Animated.add(wave, new Animated.Value(0.3)) }] }]} />
                ))}
              </View>
            )}
            <Text style={[styles.status, { color: colors.mutedForeground }]}>
              {!audioReady && "تیار ہو رہا ہے..."}
              {audioReady && phase === "idle" && "مائیک دبائیں"}
              {phase === "listening" && "سن رہا ہوں... 🎤 (رکنے کے لیے دوبارہ دبائیں)"}
              {phase === "transcribing" && "آواز کو سمجھ رہا ہوں..."}
              {phase === "processing" && "Gemini سوچ رہا ہے..."}
              {phase === "responding" && "جواب سنا رہا ہوں... 🔊"}
            </Text>
          </View>

          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
          {transcript ? (
            <View style={[styles.transcriptBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.transcriptLabel, { color: colors.mutedForeground }]}>آپ نے کہا:</Text>
              <Text style={[styles.transcript, { color: colors.foreground }]}>{transcript}</Text>
            </View>
          ) : null}
          {response ? (
            <View style={[styles.responseBox, { backgroundColor: colors.accent }]}>
              <Feather name="volume-2" size={18} color={colors.primary} />
              <Text style={[styles.response, { color: colors.foreground }]}>{response}</Text>
            </View>
          ) : null}

          <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>مثال کے طور پر پوچھیں:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {URDU_COMMANDS.map(command => (
              <Pressable key={command} onPress={() => handleCommandPress(command)} style={[styles.suggestion, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>{command}</Text>
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
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 3 },
  closeBtn: { padding: 4 },
  micArea: { alignItems: "center", marginBottom: 24 },
  micOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  micMiddle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  micBtn: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  waves: { flexDirection: "row", gap: 4, marginTop: 16, alignItems: "center", height: 40 },
  wave: { width: 4, borderRadius: 2 },
  status: { marginTop: 12, fontSize: 14, fontWeight: "500" },
  error: { fontSize: 12, textAlign: "center", marginBottom: 12 },
  transcriptBox: { padding: 14, borderRadius: 12, marginBottom: 12 },
  transcriptLabel: { fontSize: 11, marginBottom: 4 },
  transcript: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  responseBox: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, marginBottom: 16, alignItems: "flex-start" },
  response: { fontSize: 14, flex: 1, lineHeight: 22, textAlign: "right" },
  suggestLabel: { fontSize: 12, marginBottom: 8 },
  suggestions: { flexDirection: "row" },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  suggestionText: { fontSize: 12, flexShrink: 0 },
});