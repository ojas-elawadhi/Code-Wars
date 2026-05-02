import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors, spacing } from "../utils/theme";

type RuleMode = "classic" | "duel";

export default function SoloSetupScreen() {
  const [ruleMode, setRuleMode] = useState<RuleMode>("classic");
  const isClassic = ruleMode === "classic";

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Solo</Text>
        <Text style={styles.title}>Choose A Mode</Text>
        <Text style={styles.subtitle}>
          Solo mode is the next feature to build. The structure is ready so we can wire Classic and Duel one by one.
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
            <Text style={styles.modeText}>Guess one hidden number on your own.</Text>
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
            <Text style={styles.modeText}>Face a CPU that hides its own secret number.</Text>
          </Pressable>
        </View>

        <PrimaryButton
          disabled={!isClassic}
          label={isClassic ? "Play Solo Classic" : "Solo Duel Coming Next"}
          onPress={() => {
            if (isClassic) {
              router.push("/solo-classic");
            }
          }}
        />

        <Text style={styles.helper}>
          {isClassic
            ? "Solo Classic is ready to play. Solo Duel is the next mode to build."
            : "Solo Duel is the next solo mode to build."}
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
