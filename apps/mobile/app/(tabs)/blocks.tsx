// ============================================================================
// BLOCKS Mobile - Quick Add Blocks Page
// Tap to instantly add tasks to timeline
// ============================================================================

import { useState, useCallback } from "react";
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
import * as Haptics from "expo-haptics";
import { useQuickBlocksStore } from "@/hooks/useQuickBlocksStore";
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

export default function BlocksPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  
  const { blocks, loadBlocks, initializeDefaultBlocks } = useQuickBlocksStore();
  const { createTask } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBlocks();
    setRefreshing(false);
  }, [loadBlocks]);
  
  const handleBlockPress = useCallback(async (block: typeof blocks[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPressedId(block.id);
    
    try {
      // Create task from block and schedule it
      await createTask({
        name: block.name,
        status: "doing",
        blockSize: "30min", // Default
        blockCount: Math.ceil(block.defaultDuration / 30),
        scheduledAt: new Date(),
        isPutzing: block.isPutzing,
        isQuickAdd: true,
        priority: "3",
        assigneeId: "me",
        accessContexts: [],
        tags: [],
        subtasks: [],
        reminders: [],
        recurrence: "none",
      });
      
      // Show success feedback
      setTimeout(() => {
        setPressedId(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    } catch (error) {
      console.error("Failed to create task:", error);
      setPressedId(null);
    }
  }, [createTask]);
  
  // Calculate stats
  const totalBlocks = blocks.length;
  const productiveBlocks = blocks.filter((b) => b.category === "productive").length;
  const choreBlocks = blocks.filter((b) => b.category === "chores").length;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgSecondary }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Blocks
          </Text>
          <Pressable style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Tap to add to timeline
        </Text>
      </View>
      
      {/* Stats */}
      {totalBlocks > 0 && (
        <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalBlocks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Total
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accentGreen }]}>
              {productiveBlocks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Productive
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {choreBlocks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Chores
            </Text>
          </View>
        </View>
      )}
      
      {/* Blocks grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.blocksGrid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {blocks.map((block) => (
          <Pressable
            key={block.id}
            style={[
              styles.blockTile,
              {
                backgroundColor: block.color + "20",
                borderColor: block.color,
              },
              pressedId === block.id && styles.blockTilePressed,
            ]}
            onPress={() => handleBlockPress(block)}
          >
            {block.icon && (
              <Text style={styles.blockIcon}>{block.icon}</Text>
            )}
            <Text
              style={[styles.blockName, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {block.name}
            </Text>
            <Text style={[styles.blockDuration, { color: colors.textMuted }]}>
              {block.defaultDuration} min
            </Text>
            
            {/* Success indicator */}
            {pressedId === block.id && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={32} color={colors.accentGreen} />
              </View>
            )}
          </Pressable>
        ))}
        
        {/* Empty slots */}
        {blocks.length < 15 &&
          Array.from({ length: 15 - blocks.length }).map((_, i) => (
            <View
              key={`empty-${i}`}
              style={[styles.emptySlot, { borderColor: colors.border }]}
            >
              <Ionicons name="add" size={24} color={colors.textMuted} />
            </View>
          ))}
      </ScrollView>
      
      {/* Empty state */}
      {blocks.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
            No quick blocks yet
          </Text>
          <Pressable
            style={[styles.createButton, { backgroundColor: colors.accent }]}
            onPress={() => initializeDefaultBlocks()}
          >
            <Text style={styles.createButtonText}>Create Defaults</Text>
          </Pressable>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  blocksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  blockTile: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  blockTilePressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  blockIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  blockName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  blockDuration: {
    fontSize: 10,
    marginTop: 4,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 255, 136, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptySlot: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

