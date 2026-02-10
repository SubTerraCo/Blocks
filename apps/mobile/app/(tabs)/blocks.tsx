// ============================================================================
// BLOCKS Mobile - Quick Add Blocks Page
// Tap to open placement picker, then add to timeline
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
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuickBlocksStore, QuickAddBlock } from "@/hooks/useQuickBlocksStore";
import { useTaskStore } from "@/hooks/useTaskStore";
import { TopBar } from "@/components/TopBar";

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

type PlacementOption = "after_current" | "next_free" | "end_of_day" | "custom";

const PLACEMENT_OPTIONS: { value: PlacementOption; label: string; icon: string; description: string }[] = [
  { 
    value: "after_current", 
    label: "After Current Task", 
    icon: "arrow-forward",
    description: "Schedule immediately after the active task"
  },
  { 
    value: "next_free", 
    label: "Next Free Slot", 
    icon: "time-outline",
    description: "Find the first available gap in your schedule"
  },
  { 
    value: "end_of_day", 
    label: "End of Day", 
    icon: "moon-outline",
    description: "Add to the end of your work hours"
  },
  { 
    value: "custom", 
    label: "Custom Time...", 
    icon: "calendar-outline",
    description: "Choose a specific time"
  },
];

export default function BlocksPage() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();
  
  const { blocks, loadBlocks, initializeDefaultBlocks, incrementUsage } = useQuickBlocksStore();
  const { tasks, createTask } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<QuickAddBlock | null>(null);
  const [showPlacementPicker, setShowPlacementPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBlocks();
    setRefreshing(false);
  }, [loadBlocks]);
  
  const handleBlockPress = useCallback((block: QuickAddBlock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBlock(block);
    setShowPlacementPicker(true);
  }, []);
  
  const getScheduledTime = (placement: PlacementOption): Date => {
    const now = new Date();
    
    switch (placement) {
      case "after_current": {
        // Find the currently active task
        const activeTask = tasks.find((t) => {
          if (!t.scheduledAt) return false;
          const scheduledTime = new Date(t.scheduledAt);
          const endTime = new Date(scheduledTime.getTime() + (t.duration || 30) * 60000);
          return scheduledTime <= now && endTime > now;
        });
        
        if (activeTask && activeTask.scheduledAt) {
          const scheduledTime = new Date(activeTask.scheduledAt);
          const endTime = new Date(scheduledTime.getTime() + (activeTask.duration || 30) * 60000);
          return endTime;
        }
        
        // No active task, schedule now
        return now;
      }
      
      case "next_free": {
        // Find the next free 30-minute slot
        const scheduledTasks = tasks
          .filter((t) => t.scheduledAt)
          .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
        
        let candidateTime = new Date(now);
        candidateTime.setMinutes(Math.ceil(candidateTime.getMinutes() / 15) * 15, 0, 0);
        
        for (const task of scheduledTasks) {
          const taskStart = new Date(task.scheduledAt!);
          const taskEnd = new Date(taskStart.getTime() + (task.duration || 30) * 60000);
          
          if (candidateTime >= taskStart && candidateTime < taskEnd) {
            candidateTime = taskEnd;
          }
        }
        
        return candidateTime;
      }
      
      case "end_of_day": {
        // Schedule at 5 PM or after the last task
        const endOfDay = new Date(now);
        endOfDay.setHours(17, 0, 0, 0);
        
        const lastTask = tasks
          .filter((t) => t.scheduledAt)
          .sort((a, b) => new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime())[0];
        
        if (lastTask && lastTask.scheduledAt) {
          const lastTaskEnd = new Date(
            new Date(lastTask.scheduledAt).getTime() + (lastTask.duration || 30) * 60000
          );
          return lastTaskEnd > endOfDay ? lastTaskEnd : endOfDay;
        }
        
        return endOfDay;
      }
      
      case "custom":
      default:
        // Return now for custom (will navigate to add-task page)
        return now;
    }
  };
  
  const handlePlacementSelect = useCallback(async (placement: PlacementOption) => {
    if (!selectedBlock) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPlacementPicker(false);
    setPressedId(selectedBlock.id);
    
    if (placement === "custom") {
      // Navigate to add task page with block info
      router.push(`/add-task?name=${encodeURIComponent(selectedBlock.name)}&duration=${selectedBlock.defaultDuration}`);
      setPressedId(null);
      setSelectedBlock(null);
      return;
    }
    
    try {
      const scheduledTime = getScheduledTime(placement);
      
      await createTask({
        name: selectedBlock.name,
        status: "doing",
        blockSize: "30min",
        blockCount: Math.ceil(selectedBlock.defaultDuration / 30),
        duration: selectedBlock.defaultDuration,
        scheduledAt: scheduledTime,
        isPutzing: selectedBlock.isPutzing,
        isQuickAdd: true,
        priority: "3",
        assigneeId: "me",
        accessContexts: [],
        tags: [],
        subtasks: [],
        reminders: [],
        recurrence: "none",
        color: selectedBlock.color,
      });
      
      // Increment usage count
      incrementUsage(selectedBlock.id);
      
      // Show success feedback
      setTimeout(() => {
        setPressedId(null);
        setSelectedBlock(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    } catch (error) {
      console.error("Failed to create task:", error);
      setPressedId(null);
      setSelectedBlock(null);
    }
  }, [selectedBlock, createTask, incrementUsage, router, tasks]);
  
  // Calculate stats
  const totalBlocks = blocks.length;
  const productiveBlocks = blocks.filter((b) => b.category === "productive").length;
  const choreBlocks = blocks.filter((b) => b.category === "chores").length;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar 
        title="Blocks" 
        subtitle={isEditing ? "Tap to edit" : "Tap to add to timeline"} 
      />
      
      {/* Edit Toggle */}
      <View style={[styles.editBar, { backgroundColor: colors.bgSecondary }]}>
        <Text style={[styles.editLabel, { color: colors.textMuted }]}>
          {blocks.length} quick blocks
        </Text>
        <Pressable
          style={[styles.editButton, isEditing && { backgroundColor: colors.accent }]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={[styles.editButtonText, { color: isEditing ? "#FFFFFF" : colors.accent }]}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>
      
      {/* Stats */}
      {totalBlocks > 0 && !isEditing && (
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
              isEditing && styles.blockTileEditing,
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
            
            {/* Usage indicator */}
            {block.usageCount > 0 && !isEditing && (
              <View style={[styles.usageBadge, { backgroundColor: colors.bgTertiary }]}>
                <Text style={[styles.usageText, { color: colors.textMuted }]}>
                  ×{block.usageCount}
                </Text>
              </View>
            )}
            
            {/* Edit indicator */}
            {isEditing && (
              <View style={styles.editOverlay}>
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </View>
            )}
            
            {/* Success indicator */}
            {pressedId === block.id && !isEditing && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={32} color={colors.accentGreen} />
              </View>
            )}
          </Pressable>
        ))}
        
        {/* Empty slots */}
        {blocks.length < 15 &&
          Array.from({ length: Math.min(3, 15 - blocks.length) }).map((_, i) => (
            <Pressable
              key={`empty-${i}`}
              style={[styles.emptySlot, { borderColor: colors.border }]}
              onPress={() => router.push("/add-task")}
            >
              <Ionicons name="add" size={24} color={colors.textMuted} />
              <Text style={[styles.emptySlotText, { color: colors.textMuted }]}>
                Add Block
              </Text>
            </Pressable>
          ))}
      </ScrollView>
      
      {/* Empty state */}
      {blocks.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
            No quick blocks yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Create preset task blocks for quick scheduling
          </Text>
          <Pressable
            style={[styles.createButton, { backgroundColor: colors.accent }]}
            onPress={() => initializeDefaultBlocks()}
          >
            <Text style={styles.createButtonText}>Create Defaults</Text>
          </Pressable>
        </View>
      )}
      
      {/* Placement Picker Modal */}
      <Modal
        visible={showPlacementPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlacementPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlacementPicker(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={[styles.modalContent, { backgroundColor: colors.bgSecondary }]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Where to schedule?
              </Text>
              {selectedBlock && (
                <View style={styles.modalBlockInfo}>
                  <Text style={[styles.modalBlockName, { color: colors.accent }]}>
                    {selectedBlock.name}
                  </Text>
                  <Text style={[styles.modalBlockDuration, { color: colors.textMuted }]}>
                    {selectedBlock.defaultDuration} minutes
                  </Text>
                </View>
              )}
            </View>
            
            {/* Placement Options */}
            <View style={styles.placementOptions}>
              {PLACEMENT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.placementOption, { borderColor: colors.border }]}
                  onPress={() => handlePlacementSelect(option.value)}
                >
                  <View style={[styles.placementIcon, { backgroundColor: colors.bgTertiary }]}>
                    <Ionicons name={option.icon as any} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.placementText}>
                    <Text style={[styles.placementLabel, { color: colors.textPrimary }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.placementDesc, { color: colors.textMuted }]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
            
            {/* Cancel Button */}
            <Pressable
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShowPlacementPicker(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>
                Cancel
              </Text>
            </Pressable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editLabel: {
    fontSize: 13,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
    paddingBottom: 120,
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
  blockTileEditing: {
    borderStyle: "dashed",
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
  usageBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  usageText: {
    fontSize: 10,
    fontWeight: "600",
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
    gap: 4,
  },
  emptySlotText: {
    fontSize: 10,
  },
  emptyState: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalBlockInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  modalBlockName: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalBlockDuration: {
    fontSize: 13,
    marginTop: 2,
  },
  placementOptions: {
    gap: 12,
  },
  placementOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  placementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  placementText: {
    flex: 1,
  },
  placementLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  placementDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
