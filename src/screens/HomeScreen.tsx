import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../components/ScreenContainer";
import { useGameStore } from "../store/useGameStore";
import { colors, spacing } from "../utils/theme";

export default function HomeScreen() {
  const isConnected = useGameStore((state) => state.isConnected);
  const errorMessage = useGameStore((state) => state.errorMessage);

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Game Modes</Text>
        <Text style={styles.title}>Higher or Lower</Text>
        <Text style={styles.subtitle}>
          Pick how you want to play first, then we&apos;ll take you to the right mode setup.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => router.push("/solo")}
            style={({ pressed }) => [
              styles.modeCard,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Solo</Text>
            <Text style={styles.modeText}>Play against the game, then choose Classic or Duel on the next screen.</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/private")}
            style={({ pressed }) => [
              styles.modeCard,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Private</Text>
            <Text style={styles.modeText}>Create a room code, invite friends, then choose Classic or Duel on the next screen.</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.connection}>
          {isConnected ? "Server connected" : "Connecting to server..."}
        </Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    gap: spacing.sm
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  modeRow: {
    gap: spacing.sm
  },
  modeCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xs
  },
  modeCardPressed: {
    opacity: 0.9
  },
  modeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  footer: {
    gap: spacing.sm
  },
  connection: {
    color: colors.textMuted,
    fontSize: 13
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});
