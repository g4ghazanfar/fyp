import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CHAT_CONTACTS, ChatContact, ChatMessage } from "@/data/chatData";
import { apiRequest } from "@/data/api";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [contacts, setContacts] = useState<ChatContact[]>(CHAT_CONTACTS);
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: activeChat ? { display: "none" } : undefined });
    return () => navigation.setOptions({ tabBarStyle: undefined });
  }, [activeChat, navigation]);

  const openChat = (contact: ChatContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = contacts.map(c =>
      c.id === contact.id ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c
    );
    setContacts(updated);
    setActiveChat(updated.find(c => c.id === contact.id)!);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString("ur-PK", { hour: "2-digit", minute: "2-digit" }),
      isRead: true,
    };
    setInput("");
    const contactBeforeReply = activeChat;
    const withUserMessage = { ...contactBeforeReply, messages: [...contactBeforeReply.messages, userMsg], lastMessage: message };
    setActiveChat(withUserMessage);
    setContacts(prev => prev.map(c => c.id === contactBeforeReply.id ? withUserMessage : c));
    setSending(true);
    try {
      const response = await apiRequest<{ reply: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message, healthProfile: user?.healthProfile || {} }),
      });
      const aiMsg: ChatMessage = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        text: response.reply,
        time: new Date().toLocaleTimeString("ur-PK", { hour: "2-digit", minute: "2-digit" }),
        isRead: false,
      };
      setActiveChat(current => current ? { ...current, messages: [...current.messages, aiMsg], lastMessage: response.reply.slice(0, 40) + "..." } : current);
      setContacts(prev => prev.map(c => c.id === contactBeforeReply.id
        ? { ...c, messages: [...c.messages, aiMsg], lastMessage: response.reply.slice(0, 40) + "..." }
        : c));
    } catch {
      const errorMsg: ChatMessage = {
        id: `${Date.now()}-error`,
        sender: "ai",
        text: "I’m having trouble connecting right now. Please try again.",
        time: new Date().toLocaleTimeString("ur-PK", { hour: "2-digit", minute: "2-digit" }),
        isRead: false,
      };
      setActiveChat(current => current ? { ...current, messages: [...current.messages, errorMsg], lastMessage: errorMsg.text } : current);
      setContacts(prev => prev.map(c => c.id === contactBeforeReply.id
        ? { ...c, messages: [...c.messages, errorMsg], lastMessage: errorMsg.text }
        : c));
    } finally {
      setSending(false);
    }
  };

  if (activeChat) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.chatHeader, { paddingTop: isWeb ? 67 : insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => setActiveChat(null)} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{activeChat.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactName, { color: colors.foreground }]}>{activeChat.name}</Text>
            <Text style={[styles.contactRole, { color: activeChat.online ? colors.success : colors.mutedForeground }]}>
              {activeChat.role} / {activeChat.online ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.messages}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {activeChat.messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.msgRow, { justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }]}
            >
              <View style={[styles.bubble, {
                backgroundColor: msg.sender === "user" ? colors.primary : colors.card,
                maxWidth: "80%",
              }]}>
                <Text style={[styles.bubbleText, { color: msg.sender === "user" ? "#fff" : colors.foreground, textAlign: "right" }]}>
                  {msg.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: isWeb ? 34 : insets.bottom + 8 }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.input, color: colors.foreground }]}
            placeholder="اپنا سوال لکھیں... / Type your message"
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            textAlign="right"
          />
          <Pressable onPress={sendMessage} disabled={sending} style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sending ? 0.6 : 1 }]}>
            <Feather name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>پیغامات</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {contacts.map(contact => (
          <Pressable
            key={contact.id}
            onPress={() => openChat(contact)}
            style={({ pressed }) => [styles.contactRow, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.contactAvatarText}>{contact.avatar}</Text>
              {contact.online && <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.contactTop}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                <Text style={[styles.contactTime, { color: colors.mutedForeground }]}>{contact.lastTime}</Text>
              </View>
              <Text style={[styles.contactRole, { color: colors.primary }]}>{contact.role}</Text>
              <Text style={[styles.lastMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                {contact.lastMessage}
              </Text>
            </View>
            {contact.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{contact.unread}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
  title: { fontSize: theme.type.hero, fontFamily: theme.fonts.heading },
  subtitle: { fontSize: theme.type.sm, marginTop: 4 },
  contactRow: { flexDirection: "row", gap: theme.spacing.sm, padding: theme.spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border, alignItems: "center" },
  contactAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contactAvatarText: { fontSize: 22 },
  onlineDot: { position: "absolute", bottom: 1, right: 1, width: 13, height: 13, borderRadius: 6.5, borderWidth: 2, borderColor: "#fff" },
  contactTop: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.xs },
  contactName: { fontSize: theme.type.sm, fontFamily: theme.fonts.headingMedium, flexShrink: 1 },
  contactRole: { fontSize: theme.type.xs, marginTop: 4, fontFamily: theme.fonts.bodySemibold },
  lastMsg: { fontSize: theme.type.sm, marginTop: 4, textAlign: "right", flexShrink: 1 },
  contactTime: { fontSize: 11, flexShrink: 0 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  messages: { flex: 1 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18 },
  msgRow: { flexDirection: "row", marginBottom: 12 },
  bubble: { padding: 12, borderRadius: 16, gap: 4 },
  bubbleText: { fontSize: theme.type.sm, lineHeight: 22, flexShrink: 1 },
  bubbleTime: { fontSize: 10, textAlign: "right" },
  inputRow: { flexDirection: "row", gap: 10, padding: 12, paddingTop: 10, borderTopWidth: 1 },
  chatInput: { flex: 1, minWidth: 0, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.md, paddingVertical: 10, fontSize: theme.type.sm, textAlign: "right" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  success: { color: "#10B981" },
});
