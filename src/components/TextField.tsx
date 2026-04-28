import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, spacing } from "../utils/theme";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "characters" | "sentences" | "words";
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  maxLength
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14
  }
});

