// ============================================================================
// BLOCKS Mobile - Settings Page
// App configuration and preferences
// ============================================================================

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { useSettingsStore, ThemeMode } from "@/hooks/useSettingsStore";
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

const THEMES: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "light", label: "Light", icon: "sunny" },
  { value: "system", label: "System", icon: "phone-portrait" },
];

const WORK_DAYS = [
  { value: 0, label: "S" },
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
];

export default function SettingsPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    theme,
    setTheme,
    workSchedule,
    setWorkSchedule,
    notifications,
    setNotifications,
    ai,
    setAISettings,
    syncEnabled,
    setSyncEnabled,
    lastSyncDate,
  } = useSettingsStore();
  
  const { tasks } = useTaskStore();
  
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleExportJSON = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const data = {
        tasks,
        exportedAt: new Date().toISOString(),
        version: "0.0.3",
      };
      
      const fileUri = FileSystem.documentDirectory + "blocks-export.json";
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      Alert.alert(
        "Export Complete",
        `Data exported to:\n${fileUri}`,
        [{ text: "OK" }]
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Could not export data. Please try again.");
    }
  };
  
  const handleExportCSV = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const headers = "ID,Name,Status,Priority,Duration,Created At,Completed At\n";
      const rows = tasks
        .map(
          (t) =>
            `"${t.id}","${t.name}","${t.status}","${t.priority}","${t.duration || 30}","${t.createdAt}","${t.completedAt || ""}"`
        )
        .join("\n");
      
      const csv = headers + rows;
      const fileUri = FileSystem.documentDirectory + "blocks-export.csv";
      await FileSystem.writeAsStringAsync(fileUri, csv);
      
      Alert.alert(
        "Export Complete",
        `Data exported to:\n${fileUri}`,
        [{ text: "OK" }]
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Could not export data. Please try again.");
    }
  };
  
  const toggleWorkDay = (day: number) => {
    const currentDays = workSchedule.workDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    setWorkSchedule({ workDays: newDays });
  };
  
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
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            APPEARANCE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
              Theme
            </Text>
            <View style={styles.themeOptions}>
              {THEMES.map((t) => (
                <Pressable
                  key={t.value}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        theme === t.value ? colors.accent : colors.bgTertiary,
                    },
                  ]}
                  onPress={() => setTheme(t.value)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={18}
                    color={theme === t.value ? "#FFFFFF" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeText,
                      { color: theme === t.value ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        
        {/* Work Schedule Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            WORK SCHEDULE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Work Start Time
              </Text>
              <TextInput
                style={[styles.timeInput, { color: colors.textPrimary, backgroundColor: colors.bgTertiary }]}
                value={workSchedule.startTime}
                onChangeText={(text) => setWorkSchedule({ startTime: text })}
                placeholder="09:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Work End Time
              </Text>
              <TextInput
                style={[styles.timeInput, { color: colors.textPrimary, backgroundColor: colors.bgTertiary }]}
                value={workSchedule.endTime}
                onChangeText={(text) => setWorkSchedule({ endTime: text })}
                placeholder="17:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.workDaysRow}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Work Days
              </Text>
              <View style={styles.workDays}>
                {WORK_DAYS.map((day) => (
                  <Pressable
                    key={day.value}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: workSchedule.workDays.includes(day.value)
                          ? colors.accent
                          : colors.bgTertiary,
                      },
                    ]}
                    onPress={() => toggleWorkDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: workSchedule.workDays.includes(day.value)
                            ? "#FFFFFF"
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            NOTIFICATIONS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Enable Notifications
              </Text>
              <Switch
                value={notifications.enabled}
                onValueChange={(value) => setNotifications({ enabled: value })}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Task Reminders
              </Text>
              <Switch
                value={notifications.taskReminders}
                onValueChange={(value) => setNotifications({ taskReminders: value })}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
                disabled={!notifications.enabled}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Timer Alerts
              </Text>
              <Switch
                value={notifications.timerAlerts}
                onValueChange={(value) => setNotifications({ timerAlerts: value })}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
                disabled={!notifications.enabled}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Daily Summary
              </Text>
              <Switch
                value={notifications.dailySummary}
                onValueChange={(value) => setNotifications({ dailySummary: value })}
                trackColor={{ false: colors.bgTertiary, true: colors.accent }}
                disabled={!notifications.enabled}
              />
            </View>
          </View>
        </View>
        
        {/* AI Assistant Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            AI ASSISTANT
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                AI Enabled
              </Text>
              <Switch
                value={ai.enabled}
                onValueChange={(value) => setAISettings({ enabled: value })}
                trackColor={{ false: colors.bgTertiary, true: colors.accentCyan }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Provider
              </Text>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                Google Gemini
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.apiKeyRow}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                API Key
              </Text>
              <View style={styles.apiKeyInput}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgTertiary }]}
                  value={ai.apiKey}
                  onChangeText={(text) => setAISettings({ apiKey: text })}
                  placeholder="Enter API key..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showApiKey}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowApiKey(!showApiKey)}
                >
                  <Ionicons
                    name={showApiKey ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        
        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            DATA
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <Pressable style={styles.actionRow} onPress={handleExportJSON}>
              <Ionicons name="download-outline" size={20} color={colors.accentCyan} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Export Data (JSON)
              </Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable style={styles.actionRow} onPress={handleExportCSV}>
              <Ionicons name="document-text-outline" size={20} color={colors.accentCyan} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Export Data (CSV)
              </Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                P2P Sync
              </Text>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: colors.bgTertiary, true: colors.accentGreen }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Last Sync
              </Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>
                {lastSyncDate
                  ? new Date(lastSyncDate).toLocaleDateString()
                  : "Never"}
              </Text>
            </View>
          </View>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            ABOUT
          </Text>
          <View style={[styles.card, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Version
              </Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>
                0.0.3
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Build
              </Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>
                Android
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
    padding: 12,
  },
  themeOptions: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  themeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  workDaysRow: {
    padding: 12,
    gap: 12,
  },
  workDays: {
    flexDirection: "row",
    gap: 6,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeInput: {
    padding: 8,
    borderRadius: 6,
    fontSize: 15,
    textAlign: "center",
    minWidth: 70,
  },
  apiKeyRow: {
    padding: 12,
    gap: 8,
  },
  apiKeyInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  eyeButton: {
    padding: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
  },
});

