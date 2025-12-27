// ============================================================================
// BLOCKS Mobile - Add Task Modal
// Create new task form
// ============================================================================

import { useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTaskStore } from "@/hooks/useTaskStore";
import type { TaskStatus, TaskPriority, BlockSize } from "@blocks/core";

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
    accentGreen: "#00CC66",
  },
};

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "1", label: "P1" },
  { value: "2", label: "P2" },
  { value: "3", label: "P3" },
  { value: "4", label: "P4" },
  { value: "5", label: "P5" },
];

const BLOCK_SIZES: { value: BlockSize; label: string }[] = [
  { value: "15min", label: "15m" },
  { value: "30min", label: "30m" },
  { value: "1hour", label: "1h" },
  { value: "1week", label: "1w" },
];

const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "#3B82F6" },
  { value: "design", label: "Design", color: "#A855F7" },
  { value: "todo", label: "To Do", color: "#EC4899" },
  { value: "doing", label: "Doing", color: "#F97316" },
  { value: "review", label: "Review", color: "#EAB308" },
];

export default function AddTaskModal() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();
  
  const { createTask } = useTaskStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("3");
  const [status, setStatus] = useState<TaskStatus>((params.status as TaskStatus) || "todo");
  const [blockSize, setBlockSize] = useState<BlockSize>("30min");
  const [blockCount, setBlockCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    
    try {
      await createTask({
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        blockSize,
        blockCount,
        assigneeId: "me",
        accessContexts: [],
        tags: [],
        subtasks: [],
        reminders: [],
        recurrence: "none",
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Failed to create task:", error);
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          New Task
        </Text>
        <Pressable
          onPress={handleSubmit}
          style={[
            styles.saveButton,
            { backgroundColor: name.trim() ? colors.accent : colors.bgTertiary },
          ]}
          disabled={!name.trim() || isSubmitting}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: name.trim() ? "#FFFFFF" : colors.textMuted },
            ]}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        {/* Name input */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Task Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>
        
        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Description</Text>
          <TextInput
            style={[styles.textarea, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
            placeholder="Add details..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
          <View style={styles.optionsRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: status === s.value ? s.color : colors.bgSecondary,
                    borderColor: s.color,
                  },
                ]}
                onPress={() => setStatus(s.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: status === s.value ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Priority */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Priority</Text>
          <View style={styles.optionsRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: priority === p.value ? colors.accent : colors.bgSecondary,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: priority === p.value ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Block Size */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Block Size</Text>
          <View style={styles.optionsRow}>
            {BLOCK_SIZES.map((b) => (
              <Pressable
                key={b.value}
                style={[
                  styles.blockButton,
                  {
                    backgroundColor: blockSize === b.value ? colors.accentGreen : colors.bgSecondary,
                  },
                ]}
                onPress={() => setBlockSize(b.value)}
              >
                <Text
                  style={[
                    styles.blockText,
                    { color: blockSize === b.value ? "#000000" : colors.textSecondary },
                  ]}
                >
                  {b.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Block Count */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Block Count</Text>
          <View style={styles.counterRow}>
            <Pressable
              style={[styles.counterButton, { backgroundColor: colors.bgSecondary }]}
              onPress={() => setBlockCount(Math.max(1, blockCount - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={[styles.counterValue, { color: colors.textPrimary }]}>
              {blockCount}
            </Text>
            <Pressable
              style={[styles.counterButton, { backgroundColor: colors.bgSecondary }]}
              onPress={() => setBlockCount(Math.min(5, blockCount + 1))}
            >
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 20,
    paddingBottom: 100,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textarea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  priorityButton: {
    width: 48,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  blockButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  blockText: {
    fontSize: 14,
    fontWeight: "600",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
});

