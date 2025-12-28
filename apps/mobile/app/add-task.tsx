// ============================================================================
// BLOCKS Mobile - Add Task Modal
// Full-featured task creation form
// ============================================================================

import { useState, useCallback } from "react";
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
  Switch,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTaskStore } from "@/hooks/useTaskStore";
import type { TaskStatus, TaskPriority, BlockSize, AccessContext, RecurrenceType, Subtask } from "@blocks/core";

// Generate UUID without crypto (React Native compatible)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    accentGreen: "#00CC66",
    accentCyan: "#00A3CC",
  },
};

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "1", label: "P1", color: "#EF4444" },
  { value: "2", label: "P2", color: "#F97316" },
  { value: "3", label: "P3", color: "#EAB308" },
  { value: "4", label: "P4", color: "#22C55E" },
  { value: "5", label: "P5", color: "#3B82F6" },
];

const BLOCK_SIZES: { value: BlockSize; label: string; minutes: number }[] = [
  { value: "15min", label: "15m", minutes: 15 },
  { value: "30min", label: "30m", minutes: 30 },
  { value: "1hour", label: "1h", minutes: 60 },
  { value: "1week", label: "1w", minutes: 10080 },
];

const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "#3B82F6" },
  { value: "design", label: "Design", color: "#A855F7" },
  { value: "todo", label: "To Do", color: "#EC4899" },
  { value: "doing", label: "Doing", color: "#F97316" },
  { value: "review", label: "Review", color: "#EAB308" },
];

const ACCESS_CONTEXTS: { value: AccessContext; label: string; icon: string }[] = [
  { value: "home", label: "Home", icon: "home" },
  { value: "errand", label: "Errand", icon: "car" },
  { value: "computer", label: "Computer", icon: "laptop" },
  { value: "phone", label: "Phone", icon: "phone-portrait" },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const TASK_COLORS = [
  "#FF3366", "#F97316", "#EAB308", "#22C55E", 
  "#00D4FF", "#3B82F6", "#8B5CF6", "#EC4899",
];

export default function AddTaskModal() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    status?: string; 
    name?: string; 
    duration?: string 
  }>();
  
  const { createTask } = useTaskStore();
  
  // Form state
  const [name, setName] = useState(params.name || "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("3");
  const [status, setStatus] = useState<TaskStatus>((params.status as TaskStatus) || "todo");
  const [blockSize, setBlockSize] = useState<BlockSize>("30min");
  const [blockCount, setBlockCount] = useState(
    params.duration ? Math.ceil(parseInt(params.duration) / 30) : 1
  );
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [taskColor, setTaskColor] = useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Computed duration
  const blockMinutes = BLOCK_SIZES.find((b) => b.value === blockSize)?.minutes || 30;
  const totalDuration = blockMinutes * blockCount;
  
  const toggleAccessContext = (context: AccessContext) => {
    setAccessContexts((prev) =>
      prev.includes(context)
        ? prev.filter((c) => c !== context)
        : [...prev, context]
    );
  };
  
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };
  
  const addSubtask = () => {
    const text = subtaskInput.trim();
    if (text) {
      const newSubtask: Subtask = {
        id: generateId(),
        name: text,
        completed: false,
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskInput("");
    }
  };
  
  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };
  
  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };
  
  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    
    try {
      const taskData = {
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        blockSize,
        blockCount,
        duration: totalDuration,
        assigneeId: "me",
        accessContexts,
        tags,
        subtasks: subtasks.map((s) => ({
          id: s.id,
          name: s.name,
          completed: s.completed,
        })),
        reminders: [],
        recurrence,
        dueDate: dueDate || undefined,
        color: taskColor,
        notes: notes.trim() || undefined,
        isQuickAdd: false,
        isPutzing: false,
      };
      
      console.log("Creating task with data:", JSON.stringify(taskData, null, 2));
      
      await createTask(taskData);
      
      console.log("Task created successfully!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Use dismiss() for modals, or navigate to tabs if that fails
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/kanban");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setIsSubmitting(false);
      // Show alert with error
      Alert.alert(
        "Error Creating Task",
        error instanceof Error ? error.message : "Unknown error occurred",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/kanban");
    }
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
            {isSubmitting ? "..." : "Save"}
          </Text>
        </Pressable>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name input */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Task Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>
        
        {/* Duration Section */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Duration: {blockSize === "1week" ? "1 week" : `${totalDuration}m`}
          </Text>
          <View style={styles.durationRow}>
            <View style={styles.durationPart}>
              <Text style={[styles.sublabel, { color: colors.textMuted }]}>Block Size</Text>
              <View style={styles.optionsRow}>
                {BLOCK_SIZES.map((b) => (
                  <Pressable
                    key={b.value}
                    style={[
                      styles.blockButton,
                      {
                        backgroundColor: blockSize === b.value ? colors.accentCyan : colors.bgSecondary,
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
            <View style={styles.durationPart}>
              <Text style={[styles.sublabel, { color: colors.textMuted }]}>× Count</Text>
              <View style={styles.counterRow}>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.bgSecondary }]}
                  onPress={() => setBlockCount(Math.max(1, blockCount - 1))}
                >
                  <Ionicons name="remove" size={18} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.counterValue, { color: colors.textPrimary }]}>
                  {blockCount}
                </Text>
                <Pressable
                  style={[styles.counterButton, { backgroundColor: colors.bgSecondary }]}
                  onPress={() => setBlockCount(Math.min(5, blockCount + 1))}
                >
                  <Ionicons name="add" size={18} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        
        {/* Status and Priority Row */}
        <View style={styles.twoColRow}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Priority</Text>
            <View style={styles.optionsRow}>
              {PRIORITIES.map((p) => (
                <Pressable
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: priority === p.value ? p.color : colors.bgSecondary,
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
        </View>
        
        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: status === s.value ? s.color : colors.bgSecondary,
                      borderColor: s.color,
                    },
                  ]}
                  onPress={() => setStatus(s.value)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: status === s.value ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Access Context */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Access Context</Text>
          <View style={styles.optionsRow}>
            {ACCESS_CONTEXTS.map((ctx) => (
              <Pressable
                key={ctx.value}
                style={[
                  styles.contextButton,
                  {
                    backgroundColor: accessContexts.includes(ctx.value)
                      ? colors.accent
                      : colors.bgSecondary,
                  },
                ]}
                onPress={() => toggleAccessContext(ctx.value)}
              >
                <Ionicons
                  name={ctx.icon as any}
                  size={18}
                  color={accessContexts.includes(ctx.value) ? "#FFFFFF" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.contextText,
                    {
                      color: accessContexts.includes(ctx.value)
                        ? "#FFFFFF"
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {ctx.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Tags */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tag, { backgroundColor: colors.accent + "30" }]}
                onPress={() => removeTag(tag)}
              >
                <Text style={[styles.tagText, { color: colors.accent }]}>
                  {tag}
                </Text>
                <Ionicons name="close" size={14} color={colors.accent} />
              </Pressable>
            ))}
          </View>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.tagInput, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
              placeholder="Add tag..."
              placeholderTextColor={colors.textMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addTagButton, { backgroundColor: colors.bgTertiary }]}
              onPress={addTag}
            >
              <Ionicons name="add" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        
        {/* Recurrence and Due Date */}
        <View style={styles.twoColRow}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Repeat</Text>
            <Pressable
              style={[styles.dropdown, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>
                {RECURRENCE_OPTIONS.find((r) => r.value === recurrence)?.label}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Due Date</Text>
            <Pressable
              style={[styles.dropdown, { backgroundColor: colors.bgSecondary }]}
              onPress={() => {
                Alert.alert(
                  "Due Date",
                  "Date picker coming in next update. Task will be created without due date.",
                  [{ text: "OK" }]
                );
              }}
            >
              <Text style={[styles.dropdownText, { color: colors.textMuted }]}>
                Coming soon...
              </Text>
              <Ionicons name="calendar" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        
        {/* Color Picker */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Color</Text>
          <View style={styles.colorsRow}>
            {TASK_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: color,
                    borderWidth: taskColor === color ? 3 : 0,
                    borderColor: "#FFFFFF",
                  },
                ]}
                onPress={() => setTaskColor(taskColor === color ? undefined : color)}
              />
            ))}
          </View>
        </View>
        
        {/* Subtasks */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Subtasks</Text>
          {subtasks.map((subtask) => (
            <View key={subtask.id} style={[styles.subtaskRow, { borderColor: colors.border }]}>
              <Pressable
                style={[
                  styles.subtaskCheckbox,
                  { borderColor: colors.accent },
                ]}
                onPress={() => toggleSubtask(subtask.id)}
              >
                {subtask.completed && (
                  <Ionicons name="checkmark" size={14} color={colors.accent} />
                )}
              </Pressable>
              <Text
                style={[
                  styles.subtaskText,
                  {
                    color: colors.textPrimary,
                    textDecorationLine: subtask.completed ? "line-through" : "none",
                    opacity: subtask.completed ? 0.6 : 1,
                  },
                ]}
              >
                {subtask.name}
              </Text>
              <Pressable onPress={() => removeSubtask(subtask.id)}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.tagInput, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
              placeholder="Add subtask..."
              placeholderTextColor={colors.textMuted}
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addTagButton, { backgroundColor: colors.bgTertiary }]}
              onPress={addSubtask}
            >
              <Ionicons name="add" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Notes</Text>
          <TextInput
            style={[styles.textarea, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
            placeholder="Additional details..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
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
    paddingBottom: 140,
  },
  field: {
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: 11,
    marginBottom: 4,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  durationRow: {
    flexDirection: "row",
    gap: 16,
  },
  durationPart: {
    flex: 1,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  priorityButton: {
    width: 40,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "600",
  },
  blockButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  blockText: {
    fontSize: 13,
    fontWeight: "600",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 20,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  contextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  contextText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
  },
  colorsRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
  },
});
