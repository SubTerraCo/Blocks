// ============================================================================
// BLOCKS Mobile - AI Assistant + Search Page
// Chat with AI for task scheduling + Search existing tasks
// ============================================================================

import { useState, useRef, useCallback, useMemo } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { TopBar } from "@/components/TopBar";
import { TaskCard } from "@/components/TaskCard";
import { useTaskStore } from "@/hooks/useTaskStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";

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
    accentGreen: "#00FF88",
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
    accentGreen: "#00CC66",
  },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type TabType = "chat" | "search";

// Gemini API integration
async function sendToGemini(
  message: string,
  tasks: any[],
  apiKey: string
): Promise<string> {
  const taskContext = tasks
    .slice(0, 20)
    .map(
      (t) =>
        `- ${t.name} (${t.status}, priority ${t.priority}, ${t.duration || 30}min)`
    )
    .join("\n");

  const systemPrompt = `You are a helpful task management assistant for the Blocks app. 
You help users organize their tasks, suggest priorities, and create schedules.
Current user tasks:
${taskContext || "No tasks yet."}

When suggesting schedules, provide clear time slots and task names.
Be concise but helpful. Use emojis sparingly for visual interest.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User: ${message}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export default function AIPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { tasks } = useTaskStore();
  const { ai } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Filtered tasks for search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

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

    if (!ai.apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Add your Gemini API key in Settings to use the AI assistant.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await sendToGemini(input.trim(), tasks, ai.apiKey);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsOnline(true);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting. Please check your internet connection or try again later.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [input, isLoading, tasks, ai.apiKey]);

  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const quickPrompts = [
    "What should I focus on today?",
    "Help me prioritize my tasks",
    "Schedule my doing tasks",
    "What's taking too long?",
  ];

  const STATUS_OPTIONS = [
    { value: null, label: "All" },
    { value: "backlog", label: "Backlog" },
    { value: "design", label: "Design" },
    { value: "todo", label: "To Do" },
    { value: "doing", label: "Doing" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
  ];

  const PRIORITY_OPTIONS = [
    { value: null, label: "All" },
    { value: "1", label: "P1" },
    { value: "2", label: "P2" },
    { value: "3", label: "P3" },
    { value: "4", label: "P4" },
    { value: "5", label: "P5" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* TopBar */}
      <TopBar
        title="AI Assistant"
        subtitle={isOnline ? "Online 🟢" : "Offline 🔴"}
      />

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgSecondary }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "chat" && { backgroundColor: colors.accent },
          ]}
          onPress={() => setActiveTab("chat")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={activeTab === "chat" ? "#FFFFFF" : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "chat" ? "#FFFFFF" : colors.textMuted },
            ]}
          >
            Chat
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "search" && { backgroundColor: colors.accent },
          ]}
          onPress={() => setActiveTab("search")}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={activeTab === "search" ? "#FFFFFF" : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "search" ? "#FFFFFF" : colors.textMuted },
            ]}
          >
            Search
          </Text>
        </Pressable>
      </View>

      {activeTab === "chat" ? (
        <>
          {/* Chat Messages */}
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
                  Ask me to help with scheduling, prioritization, or task
                  suggestions
                </Text>

                {/* Quick prompts */}
                <View style={styles.quickPrompts}>
                  {quickPrompts.map((prompt, index) => (
                    <Pressable
                      key={index}
                      style={[styles.quickPrompt, { borderColor: colors.border }]}
                      onPress={() => setInput(prompt)}
                    >
                      <Text
                        style={[
                          styles.quickPromptText,
                          { color: colors.textSecondary },
                        ]}
                      >
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
                      : [
                          styles.assistantBubble,
                          { backgroundColor: colors.bgSecondary },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color:
                          message.role === "user"
                            ? "#FFFFFF"
                            : colors.textPrimary,
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
              <View
                style={[
                  styles.assistantBubble,
                  { backgroundColor: colors.bgSecondary },
                ]}
              >
                <View style={styles.loadingDots}>
                  <ActivityIndicator size="small" color={colors.accentCyan} />
                  <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                    Thinking...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Chat Input */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.bgSecondary, borderTopColor: colors.border },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgTertiary, color: colors.textPrimary },
              ]}
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
                {
                  backgroundColor: input.trim() ? colors.accent : colors.bgTertiary,
                },
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
        </>
      ) : (
        <>
          {/* Search Tab */}
          <View style={styles.searchContainer}>
            {/* Search Input */}
            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: colors.bgSecondary },
              ]}
            >
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Filters */}
            <View style={styles.filtersRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContent}
              >
                {/* Status Filter */}
                <View style={styles.filterGroup}>
                  <Text style={[styles.filterLabel, { color: colors.textMuted }]}>
                    Status:
                  </Text>
                  <View style={styles.filterOptions}>
                    {STATUS_OPTIONS.slice(0, 4).map((option) => (
                      <Pressable
                        key={option.value || "all"}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor:
                              statusFilter === option.value
                                ? colors.accent
                                : colors.bgTertiary,
                          },
                        ]}
                        onPress={() => setStatusFilter(option.value)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            {
                              color:
                                statusFilter === option.value
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Priority Filter */}
                <View style={styles.filterGroup}>
                  <Text style={[styles.filterLabel, { color: colors.textMuted }]}>
                    Priority:
                  </Text>
                  <View style={styles.filterOptions}>
                    {PRIORITY_OPTIONS.map((option) => (
                      <Pressable
                        key={option.value || "all"}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor:
                              priorityFilter === option.value
                                ? colors.accent
                                : colors.bgTertiary,
                          },
                        ]}
                        onPress={() => setPriorityFilter(option.value)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            {
                              color:
                                priorityFilter === option.value
                                  ? "#FFFFFF"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Search Results */}
          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>
              {filteredTasks.length} tasks found
            </Text>

            {filteredTasks.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                  No tasks match your search
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => handleTaskPress(task.id)}
                  style={styles.taskCard}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
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
    paddingTop: 40,
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
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
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
  // Search styles
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersRow: {
    marginTop: 8,
  },
  filtersContent: {
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterOptions: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 120,
  },
  resultCount: {
    fontSize: 12,
    marginBottom: 12,
  },
  noResults: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  noResultsText: {
    fontSize: 14,
  },
  taskCard: {
    marginBottom: 8,
  },
});
