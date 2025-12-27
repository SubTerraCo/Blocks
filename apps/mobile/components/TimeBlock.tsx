// ============================================================================
// BLOCKS Mobile - Time Block Component
// Displays a task as a time block on the timeline
// ============================================================================

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ViewStyle,
} from "react-native";
import type { Task } from "@blocks/core";

// Colors
const COLORS = {
  dark: {
    textPrimary: "#F5F5F5",
    textSecondary: "#CCCCCC",
    textMuted: "#8B8B8B",
  },
  light: {
    textPrimary: "#0D0D0D",
    textSecondary: "#333333",
    textMuted: "#666666",
  },
};

const STATUS_COLORS: Record<string, string> = {
  backlog: "#3B82F6",
  design: "#A855F7",
  todo: "#EC4899",
  doing: "#F97316",
  review: "#EAB308",
  done: "#22C55E",
};

interface TimeBlockProps {
  task: Task;
  onPress?: () => void;
  style?: ViewStyle;
}

export function TimeBlock({ task, onPress, style }: TimeBlockProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const statusColor = STATUS_COLORS[task.status] || "#8B8B8B";
  
  const isCompleted = task.status === "done";
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const startTime = task.scheduledAt ? new Date(task.scheduledAt) : null;
  const endTime =
    startTime && task.duration
      ? new Date(startTime.getTime() + task.duration * 60000)
      : null;
  
  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: statusColor + "20",
          borderLeftColor: statusColor,
        },
        style,
      ]}
      onPress={onPress}
    >
      {/* Time range */}
      {startTime && endTime && (
        <Text style={[styles.timeRange, { color: colors.textMuted }]}>
          {formatTime(startTime)} - {formatTime(endTime)}
        </Text>
      )}
      
      {/* Task name */}
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
      
      {/* Duration */}
      <Text style={[styles.duration, { color: statusColor }]}>
        {task.duration || 30} min
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 10,
    justifyContent: "center",
  },
  timeRange: {
    fontSize: 10,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  duration: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
});

