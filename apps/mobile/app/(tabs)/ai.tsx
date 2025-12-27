// ============================================================================
// BLOCKS Mobile - AI Assistant Page
// Chat with AI for task scheduling assistance
// BUG-001 FIX: TopBar with hamburger left, title center, profile right
// ============================================================================

import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { TopBar } from "@/components/TopBar";

// Colors
const COLORS = {
  dark: {
    bg: "#0D0D0D",
    bgSecondary: "#1A1A1A",
    bgTertiary: "#2A2A2A",
    textPrimary: "#F5F5F5",
    textSecondary: "#CCCCCC",
    textMuted: "#8B8B8B",
    border: "#333333",
    accent: "#FF3366",
    accentCyan: "#00D4FF",
  },
  light: {
    bg: "#FFFFFF",
    bgSecondary: "#F5F5F5",
    bgTertiary: "#EEEEEE",
    textPrimary: "#0D0D0D",
    textSecondary: "#333333",
    textMuted: "#666666",
    border: "#DDDDDD",
    accent: "#FF3366",
    accentCyan: "#00A3CC",
  },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const scrollRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm your AI task assistant. I can help you organize your schedule, suggest task priorities, and optimize your day. What would you like help with?",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  }, [input, isLoading]);
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* BUG-001 FIX: TopBar with hamburger left, title center, profile right */}
      <TopBar title="AI Assistant" subtitle="Ask me about your tasks" />
      
      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles" size={48} color={colors.accentCyan} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              AI Task Assistant
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Ask me to help with scheduling, prioritization, or task suggestions
            </Text>
            
            {/* Quick prompts */}
            <View style={styles.quickPrompts}>
              {[
                "What should I focus on today?",
                "Help me prioritize my tasks",
                "Schedule my doing tasks",
              ].map((prompt, index) => (
                <Pressable
                  key={index}
                  style={[styles.quickPrompt, { borderColor: colors.border }]}
                  onPress={() => setInput(prompt)}
                >
                  <Text style={[styles.quickPromptText, { color: colors.textSecondary }]}>
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? [styles.userBubble, { backgroundColor: colors.accent }]
                  : [styles.assistantBubble, { backgroundColor: colors.bgSecondary }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: message.role === "user" ? "#FFFFFF" : colors.textPrimary,
                  },
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={[styles.assistantBubble, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.bgSecondary, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
          placeholder="Ask about your tasks..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={500}
        />
        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: input.trim() ? colors.accent : colors.bgTertiary },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons
            name="send"
            size={20}
            color={input.trim() ? "#FFFFFF" : colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  quickPrompts: {
    marginTop: 32,
    width: "100%",
    gap: 8,
  },
  quickPrompt: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 14,
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

