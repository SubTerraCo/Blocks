// ============================================================================
// BLOCKS Mobile - Timeline Page
// Daily schedule view with time blocks
// ============================================================================

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTaskStore } from "@/hooks/useTaskStore";
import { TimeBlock } from "@/components/TimeBlock";

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

// Generate time slots for the day
function generateTimeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}`,
    });
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();
const HOUR_HEIGHT = 60; // Height of each hour slot in pixels

export default function TimelinePage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  
  const { tasks, loadTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Filter scheduled tasks for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const scheduledTasks = tasks.filter((task) => {
    if (!task.scheduledAt) return false;
    const scheduledDate = new Date(task.scheduledAt);
    return scheduledDate >= today && scheduledDate < tomorrow;
  });
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Scroll to current hour on mount
  useEffect(() => {
    const currentHour = new Date().getHours();
    const scrollY = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollY, animated: true });
    }, 100);
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };
  
  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };
  
  // Current time indicator position
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const timeIndicatorTop = currentHour * HOUR_HEIGHT + (currentMinutes / 60) * HOUR_HEIGHT;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Timeline
        </Text>
        <Text style={[styles.headerDate, { color: colors.textMuted }]}>
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
      
      {/* Timeline */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.timelineContainer}>
          {/* Time labels */}
          <View style={styles.timeLabels}>
            {TIME_SLOTS.map((slot) => (
              <View
                key={slot.hour}
                style={[styles.timeLabel, { height: HOUR_HEIGHT }]}
              >
                <Text style={[styles.timeLabelText, { color: colors.textMuted }]}>
                  {slot.label}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Timeline grid */}
          <View style={styles.timelineGrid}>
            {/* Hour lines */}
            {TIME_SLOTS.map((slot) => (
              <View
                key={slot.hour}
                style={[
                  styles.hourLine,
                  {
                    top: slot.hour * HOUR_HEIGHT,
                    backgroundColor: colors.border,
                  },
                ]}
              />
            ))}
            
            {/* Current time indicator */}
            <View
              style={[
                styles.currentTimeIndicator,
                { top: timeIndicatorTop },
              ]}
            >
              <View style={[styles.currentTimeDot, { backgroundColor: colors.accent }]} />
              <View style={[styles.currentTimeLine, { backgroundColor: colors.accent }]} />
            </View>
            
            {/* Task blocks */}
            {scheduledTasks.map((task) => {
              const startDate = new Date(task.scheduledAt!);
              const startHour = startDate.getHours();
              const startMinutes = startDate.getMinutes();
              const top = startHour * HOUR_HEIGHT + (startMinutes / 60) * HOUR_HEIGHT;
              const duration = task.duration || 30;
              const height = (duration / 60) * HOUR_HEIGHT;
              
              return (
                <TimeBlock
                  key={task.id}
                  task={task}
                  style={{
                    position: "absolute",
                    top,
                    left: 0,
                    right: 8,
                    height: Math.max(height, 30),
                  }}
                  onPress={() => handleTaskPress(task.id)}
                />
              );
            })}
          </View>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Empty state */}
      {scheduledTasks.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
            No tasks scheduled
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Add tasks to your timeline
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerDate: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  timelineContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  timeLabels: {
    width: 60,
  },
  timeLabel: {
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: "500",
  },
  timelineGrid: {
    flex: 1,
    position: "relative",
    height: 24 * HOUR_HEIGHT,
  },
  hourLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  currentTimeIndicator: {
    position: "absolute",
    left: -8,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  currentTimeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    marginLeft: -5,
  },
  emptyState: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    transform: [{ translateY: -50 }],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});

