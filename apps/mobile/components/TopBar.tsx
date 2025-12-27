// ============================================================================
// BLOCKS Mobile - TopBar Component
// Matches Figma design: [☰ Menu] [Page Title] [Profile 👤]
// ============================================================================

import { View, Text, StyleSheet, Pressable, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Colors
const COLORS = {
  dark: {
    bg: "#0D0D0D",
    bgSecondary: "#1A1A1A",
    textPrimary: "#F5F5F5",
    textSecondary: "#CCCCCC",
    textMuted: "#8B8B8B",
    accent: "#FF3366",
  },
  light: {
    bg: "#FFFFFF",
    bgSecondary: "#F5F5F5",
    textPrimary: "#0D0D0D",
    textSecondary: "#333333",
    textMuted: "#666666",
    accent: "#FF3366",
  },
};

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  subtitle?: string;
}

export function TopBar({ title, showBackButton = false, subtitle }: TopBarProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to settings when settings page is created
    console.log("Menu pressed - will open settings");
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to profile when profile page is created
    console.log("Profile pressed - will open profile");
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      {/* Left: Menu/Back button */}
      <Pressable 
        style={styles.iconButton} 
        onPress={showBackButton ? handleBackPress : handleMenuPress}
      >
        <Ionicons 
          name={showBackButton ? "chevron-back" : "menu"} 
          size={24} 
          color={colors.textSecondary} 
        />
      </Pressable>

      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        )}
      </View>

      {/* Right: Profile button */}
      <Pressable style={styles.iconButton} onPress={handleProfilePress}>
        <View style={[styles.profileCircle, { borderColor: colors.textMuted }]}>
          <Ionicons name="person" size={18} color={colors.textMuted} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50, // Safe area for notch
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

