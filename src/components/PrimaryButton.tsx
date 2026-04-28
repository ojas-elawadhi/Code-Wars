import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "../utils/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary"
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondaryButton : styles.primaryButton,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.pressedButton
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  primaryButton: {
    backgroundColor: colors.accent
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  disabledButton: {
    opacity: 0.55
  },
  pressedButton: {
    transform: [{ scale: 0.98 }]
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  }
});

