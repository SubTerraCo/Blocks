// ============================================================================
// BLOCKS Mobile - Add Tab
// Redirects to add-task modal
// ============================================================================

import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function AddTab() {
  const router = useRouter();
  
  useFocusEffect(
    useCallback(() => {
      // Navigate to add-task modal when this tab is focused
      router.push("/add-task");
      
      // Go back to previous tab
      return () => {};
    }, [router])
  );
  
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

