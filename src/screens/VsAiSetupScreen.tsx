import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors, spacing } from "../utils/theme";

type RuleMode = "classic" | "duel";

export default function VsAiSetupScreen() {
  const [ruleMode, setRuleMode] = useState<RuleMode>("duel");
  const isClassicComingSoon = ruleMode === "classic";

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>VS AI</Text>
        <Text style={styles.title}>Choose A Mode</Text>
        <Text style={styles.subtitle}>
          Pick whether you want to race the AI toward one shared target or duel with secret numbers.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setRuleMode("classic")}
            style={({ pressed }) => [
              styles.modeCard,
              ruleMode === "classic" && styles.modeCardActive,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Classic</Text>
            <Text style={styles.modeText}>You and the AI race to one shared hidden number. Coming soon.</Text>
          </Pressable>

          <Pressable
            onPress={() => setRuleMode("duel")}
            style={({ pressed }) => [
              styles.modeCard,
              ruleMode === "duel" && styles.modeCardActive,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Duel</Text>
            <Text style={styles.modeText}>You and the AI protect your own secret numbers and guess each other.</Text>
          </Pressable>
        </View>

        <PrimaryButton
          disabled={isClassicComingSoon}
          label={isClassicComingSoon ? "VS AI Classic Coming Soon" : "Play VS AI Duel"}
          onPress={() => {
            if (!isClassicComingSoon) {
              router.push("/vs-ai-duel");
            }
          }}
        />

        <Text style={styles.helper}>
          {isClassicComingSoon
            ? "VS AI Classic will let you and the AI chase the same hidden number."
            : "VS AI Duel is ready now if you want alternating secret-number guesses."}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignSelf: "flex-start",
    marginTop: spacing.md
  },
  backLinkPressed: {
    opacity: 0.8
  },
  backText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  hero: {
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
  modeCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface
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
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  }
});
