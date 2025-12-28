// ============================================================================
// BLOCKS Mobile - Kanban Page
// Horizontal scrolling kanban board
// BUG-001 FIX: TopBar with hamburger left, title center, profile right
// BUG-002 FIX: Proper bottom padding to avoid nav bar overlap
// ============================================================================

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTaskStore } from "@/hooks/useTaskStore";
import { TaskCard } from "@/components/TaskCard";
import { TopBar } from "@/components/TopBar";
import type { TaskStatus } from "@blocks/core";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.75;

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

// Kanban columns matching desktop
const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "#3B82F6" },
  { id: "design", title: "Design", color: "#A855F7" },
  { id: "todo", title: "To Do", color: "#EC4899" },
  { id: "doing", title: "Doing", color: "#F97316" },
  { id: "review", title: "Review", color: "#EAB308" },
  { id: "done", title: "Done", color: "#22C55E" },
];

export default function KanbanPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  
  const { tasks, loadTasks, updateTask } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };
  
  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };
  
  const handleAddTask = (status: TaskStatus) => {
    router.push(`/add-task?status=${status}`);
  };
  
  // Group tasks by status
  const groupedTasks = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((t) => t.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, typeof tasks>);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* BUG-001 FIX: TopBar with hamburger left, title center, profile right */}
      <TopBar title="Kanban" subtitle={`${tasks.length} tasks`} />
      
      {/* Kanban columns */}
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH + 12}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {KANBAN_COLUMNS.map((column) => (
          <View
            key={column.id}
            style={[
              styles.column,
              { 
                backgroundColor: colors.bgSecondary, 
                width: COLUMN_WIDTH,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            {/* Column header - styled like desktop */}
            <View 
              style={[
                styles.columnHeader, 
                { backgroundColor: column.color + "20" }
              ]}
            >
              <View style={styles.columnTitleRow}>
                <View
                  style={[styles.columnDot, { backgroundColor: column.color }]}
                />
                <Text 
                  style={[
                    styles.columnTitle, 
                    { color: column.color }
                  ]}
                >
                  {column.title.toUpperCase()}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: column.color }]}>
                  <Text style={[styles.countText, { color: "#FFFFFF" }]}>
                    {groupedTasks[column.id]?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Tasks list */}
            <ScrollView
              style={styles.tasksList}
              showsVerticalScrollIndicator={false}
            >
              {groupedTasks[column.id]?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => handleTaskPress(task.id)}
                  style={styles.taskCard}
                />
              ))}
              
              {/* Add task button */}
              <Pressable
                style={[styles.addTaskButton, { borderColor: colors.border }]}
                onPress={() => handleAddTask(column.id)}
              >
                <Ionicons name="add" size={20} color={colors.textMuted} />
                <Text style={[styles.addTaskText, { color: colors.textMuted }]}>
                  Add Task
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  columnsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120, // BUG-002 FIX: Increased for nav bar
    gap: 12,
  },
  column: {
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "100%",
  },
  columnHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  columnTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  columnDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tasksList: {
    flex: 1,
    padding: 12,
  },
  taskCard: {
    marginBottom: 12,
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  addTaskText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

