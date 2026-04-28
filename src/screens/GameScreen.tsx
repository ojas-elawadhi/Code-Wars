import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { makeGuess } from "../socket/socket";
import { useGameStore } from "../store/useGameStore";
import { colors, spacing } from "../utils/theme";

export default function GameScreen() {
  const [guess, setGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { player, room, lastGuessResult, guessHistory, errorMessage, setErrorMessage } =
    useGameStore((state) => ({
      player: state.player,
      room: state.room,
      lastGuessResult: state.lastGuessResult,
      guessHistory: state.guessHistory,
      errorMessage: state.errorMessage,
      setErrorMessage: state.setErrorMessage
    }));

  useEffect(() => {
    if (!player || !room) {
      router.replace("/");
      return;
    }

    if (room.gameState === "finished") {
      router.replace("/result");
    }
  }, [player, room]);

  if (!room || !player) {
    return null;
  }

  const handleSubmitGuess = async () => {
    const parsedGuess = Number(guess);

    if (!Number.isInteger(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      setErrorMessage("Enter a whole number between 1 and 100.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await makeGuess(room.roomId, parsedGuess);
      setGuess("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not submit guess.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.label}>Round live</Text>
        <Text style={styles.title}>Guess the secret number</Text>
        <Text style={styles.subtitle}>Choose a number from 1 to 100. First correct answer wins.</Text>
      </View>

      <View style={styles.card}>
        <TextField
          keyboardType="numeric"
          label="Your guess"
          maxLength={3}
          onChangeText={setGuess}
          placeholder="Pick a number"
          value={guess}
        />
        <PrimaryButton
          label="Submit Guess"
          loading={isSubmitting}
          onPress={handleSubmitGuess}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Latest feedback</Text>
        <Text style={styles.feedbackText}>
          {lastGuessResult
            ? `Your guess of ${lastGuessResult.guess} is ${lastGuessResult.result}.`
            : "Submit a guess to get a higher, lower, or correct response."}
        </Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Previous guesses</Text>
        {guessHistory.length === 0 ? (
          <Text style={styles.feedbackText}>No guesses yet.</Text>
        ) : (
          guessHistory.map((entry, index) => (
            <Text key={`${entry.guess}-${index}`} style={styles.historyItem}>
              {entry.guess} → {entry.result}
            </Text>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    gap: spacing.xs
  },
  label: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md
  },
  feedbackCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  feedbackText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  historyItem: {
    color: colors.text,
    fontSize: 15
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});

