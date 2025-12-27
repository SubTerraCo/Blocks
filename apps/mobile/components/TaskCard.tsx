// ============================================================================
// BLOCKS Mobile - Task Card Component
// Displays a task in a card format
// ============================================================================

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Task } from "@blocks/core";

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
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  "1": "#EF4444",
  "2": "#F97316",
  "3": "#EAB308",
  "4": "#22C55E",
  "5": "#3B82F6",
};

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  style?: ViewStyle;
}

export function TaskCard({ task, onPress, style }: TaskCardProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const priorityColor = PRIORITY_COLORS[task.priority] || colors.textMuted;
  
  const isCompleted = task.status === "done";
  
  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.bgTertiary },
        style,
      ]}
      onPress={onPress}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
      
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.name,
              { color: colors.textPrimary },
              isCompleted && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {task.name}
          </Text>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          )}
        </View>
        
        {/* Meta row */}
        <View style={styles.metaRow}>
          {/* Duration */}
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {task.duration || 30}m
            </Text>
          </View>
          
          {/* Priority */}
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + "20" }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              P{task.priority}
            </Text>
          </View>
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <View style={[styles.tagBadge, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.tagText, { color: colors.textMuted }]}>
                {task.tags[0]}
                {task.tags.length > 1 && ` +${task.tags.length - 1}`}
              </Text>
            </View>
          )}
        </View>
        
        {/* Subtasks progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtasksRow}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: "#22C55E",
                    width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.subtasksText, { color: colors.textMuted }]}>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
  },
  subtasksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  subtasksText: {
    fontSize: 10,
  },
});

