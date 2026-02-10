// ============================================================================
// BLOCKS Mobile - Profile Page
// User statistics and productivity analytics
// ============================================================================

import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStatsStore } from "@/hooks/useStatsStore";
import { useTaskStore } from "@/hooks/useTaskStore";

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
    accentYellow: "#FFD700",
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
    accentYellow: "#FFB800",
  },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProfilePage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    tasksCompletedTotal,
    totalTimeTracked,
    productiveTime,
    putzingTime,
    currentStreak,
    longestStreak,
    getTodayStats,
    getWeekStats,
  } = useStatsStore();
  
  const { tasks } = useTaskStore();
  
  // Calculate stats
  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  
  // Get this week and month task counts
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const completedThisWeek = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= startOfWeek
  ).length;
  
  const completedThisMonth = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= startOfMonth
  ).length;
  
  // Get recently completed tasks
  const recentlyCompleted = useMemo(() => {
    return tasks
      .filter((t) => t.completedAt)
      .sort((a, b) => 
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )
      .slice(0, 5);
  }, [tasks]);
  
  // Calculate week progress data
  const weekProgress = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      
      const dayStats = weekStats.find((s) => s.date === dateKey);
      const tasksForDay = dayStats?.tasksCompleted || 0;
      
      // Estimate a daily goal of 5 tasks
      const progress = Math.min(100, (tasksForDay / 5) * 100);
      
      result.push({
        day: DAYS[i],
        progress,
        tasks: tasksForDay,
        isToday: date.toDateString() === now.toDateString(),
      });
    }
    return result;
  }, [weekStats, startOfWeek]);
  
  // Format time helper
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };
  
  // Productivity percentage
  const productivityPercent = totalTimeTracked > 0
    ? Math.round((productiveTime / totalTimeTracked) * 100)
    : 0;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bgSecondary, paddingTop: insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Profile
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Avatar & Name */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            Local User
          </Text>
          <Text style={[styles.userSubtitle, { color: colors.textMuted }]}>
            {currentStreak} day streak 🔥
          </Text>
        </View>
        
        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            TODAY'S PROGRESS
          </Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.statValue, { color: colors.accentGreen }]}>
                {todayStats.tasksCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Completed
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.statValue, { color: colors.accentCyan }]}>
                {formatTime(todayStats.timeTracked)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Tracked
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {todayStats.timeTracked > 0
                  ? Math.round((todayStats.productiveTime / todayStats.timeTracked) * 100)
                  : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Productive
              </Text>
            </View>
          </View>
        </View>
        
        {/* This Week */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            THIS WEEK
          </Text>
          <View style={[styles.weekCard, { backgroundColor: colors.bgSecondary }]}>
            {weekProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${day.progress}%`,
                        backgroundColor: day.isToday
                          ? colors.accent
                          : colors.accentCyan,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: day.isToday ? colors.accent : colors.textMuted,
                      fontWeight: day.isToday ? "700" : "500",
                    },
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            STATISTICS
          </Text>
          <View style={[styles.statsCard, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Tasks Completed (Total)
              </Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {tasksCompletedTotal}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Tasks Completed (This Week)
              </Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {completedThisWeek}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Tasks Completed (This Month)
              </Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {completedThisMonth}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Total Time Tracked
              </Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {formatTime(totalTimeTracked)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Average Daily Tasks
              </Text>
              <Text style={[styles.statsValue, { color: colors.textPrimary }]}>
                {weekStats.length > 0
                  ? (weekStats.reduce((sum, d) => sum + d.tasksCompleted, 0) / weekStats.length).toFixed(1)
                  : "0"}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Current Streak
              </Text>
              <Text style={[styles.statsValue, { color: colors.accentYellow }]}>
                {currentStreak} days
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow2}>
              <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Longest Streak
              </Text>
              <Text style={[styles.statsValue, { color: colors.accentYellow }]}>
                {longestStreak} days
              </Text>
            </View>
          </View>
        </View>
        
        {/* Recently Completed */}
        {recentlyCompleted.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              RECENTLY COMPLETED
            </Text>
            <View style={[styles.recentCard, { backgroundColor: colors.bgSecondary }]}>
              {recentlyCompleted.map((task, index) => (
                <View key={task.id}>
                  {index > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                  <View style={styles.recentTask}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.accentGreen}
                    />
                    <View style={styles.recentTaskContent}>
                      <Text
                        style={[styles.recentTaskName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                      <Text style={[styles.recentTaskTime, { color: colors.textMuted }]}>
                        {formatRelativeTime(task.completedAt!)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Productivity Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            PRODUCTIVITY BREAKDOWN
          </Text>
          <View style={[styles.breakdownCard, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.accentGreen }]} />
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  Productive
                </Text>
              </View>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {formatTime(productiveTime)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  Putzing
                </Text>
              </View>
              <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
                {formatTime(putzingTime)}
              </Text>
            </View>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.bgTertiary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${productivityPercent}%`,
                      backgroundColor: colors.accentGreen,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                {productivityPercent}% productive
              </Text>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  userSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  weekCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    width: 16,
    height: 80,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  statsCard: {
    borderRadius: 12,
    padding: 4,
  },
  statsRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  statsLabel: {
    fontSize: 14,
    flex: 1,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  recentCard: {
    borderRadius: 12,
    padding: 4,
  },
  recentTask: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  recentTaskContent: {
    flex: 1,
  },
  recentTaskName: {
    fontSize: 14,
    fontWeight: "500",
  },
  recentTaskTime: {
    fontSize: 12,
    marginTop: 2,
  },
  breakdownCard: {
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
});

