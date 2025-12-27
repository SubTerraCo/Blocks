// ============================================================================
// BLOCKS Mobile - Task Detail/Edit Modal
// View and edit task details
// ============================================================================

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTaskStore } from "@/hooks/useTaskStore";
import type { Task, TaskStatus, TaskPriority, BlockSize } from "@blocks/core";

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
    error: "#FF4444",
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
    error: "#DD3333",
  },
};

const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "#3B82F6" },
  { value: "design", label: "Design", color: "#A855F7" },
  { value: "todo", label: "To Do", color: "#EC4899" },
  { value: "doing", label: "Doing", color: "#F97316" },
  { value: "review", label: "Review", color: "#EAB308" },
  { value: "done", label: "Done", color: "#22C55E" },
];

export default function TaskDetailModal() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const task = tasks.find((t) => t.id === id);
  
  const [name, setName] = useState(task?.name || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || "");
      setStatus(task.status);
    }
  }, [task]);
  
  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Task not found
          </Text>
        </View>
      </View>
    );
  }
  
  const handleSave = async () => {
    if (!name.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    
    try {
      await updateTask(task.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        completedAt: status === "done" ? new Date() : undefined,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteTask(task.id);
            router.back();
          },
        },
      ]
    );
  };
  
  const handleToggleComplete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === "done" ? new Date() : undefined,
    });
    setStatus(newStatus);
  };
  
  const statusColor = STATUSES.find((s) => s.value === task.status)?.color || colors.accent;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {isEditing ? "Edit Task" : "Task Details"}
        </Text>
        {isEditing ? (
          <Pressable
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: colors.accent }]}
            disabled={!name.trim() || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "..." : "Save"}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={colors.accent} />
          </Pressable>
        )}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          <>
            {/* Edit mode */}
            <View style={styles.field}>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Task name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={styles.field}>
              <TextInput
                style={[styles.descInput, { backgroundColor: colors.bgSecondary, color: colors.textPrimary }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>
            
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
              <View style={styles.statusGrid}>
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
            </View>
          </>
        ) : (
          <>
            {/* View mode */}
            <View style={styles.taskHeader}>
              <Pressable
                style={[styles.checkbox, { borderColor: statusColor }]}
                onPress={handleToggleComplete}
              >
                {task.status === "done" && (
                  <Ionicons name="checkmark" size={20} color={statusColor} />
                )}
              </Pressable>
              <Text
                style={[
                  styles.taskName,
                  { color: colors.textPrimary },
                  task.status === "done" && styles.completedText,
                ]}
              >
                {task.name}
              </Text>
            </View>
            
            {task.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {task.description}
              </Text>
            )}
            
            {/* Status badge */}
            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusLabel, { color: statusColor }]}>
                  {STATUSES.find((s) => s.value === task.status)?.label}
                </Text>
              </View>
              
              <Text style={[styles.priority, { color: colors.textMuted }]}>
                Priority {task.priority}
              </Text>
            </View>
            
            {/* Duration */}
            <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
              <Ionicons name="time-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {task.duration || 30} minutes
              </Text>
            </View>
            
            {/* Time spent */}
            {(task.timeSpent ?? 0) > 0 && (
              <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
                <Ionicons name="stopwatch-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {task.timeSpent} minutes tracked
                </Text>
              </View>
            )}
            
            {/* Scheduled */}
            {task.scheduledAt && (
              <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Scheduled for {new Date(task.scheduledAt).toLocaleString()}
                </Text>
              </View>
            )}
          </>
        )}
        
        {/* Delete button */}
        <Pressable
          style={[styles.deleteButton, { borderColor: colors.error }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={[styles.deleteText, { color: colors.error }]}>
            Delete Task
          </Text>
        </Pressable>
      </ScrollView>
    </View>
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
  editButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  nameInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  descInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  taskName: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  priority: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  infoText: {
    fontSize: 15,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});

