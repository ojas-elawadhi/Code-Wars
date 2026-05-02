import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import type { GuessFeedback } from "../types/game.types";
import { colors, spacing } from "../utils/theme";

interface PracticeGuessEntry {
  guess: number;
  result: GuessFeedback;
}

const randomNumber = () => Math.floor(Math.random() * 100) + 1;

export default function PracticeScreen() {
  const [secretNumber, setSecretNumber] = useState(randomNumber);
  const [guess, setGuess] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PracticeGuessEntry | null>(null);
  const [guessHistory, setGuessHistory] = useState<PracticeGuessEntry[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const latestFeedback = useMemo(() => {
    if (!lastResult) {
      return "Guess a number from 1 to 100. You will get an instant higher or lower hint after each try.";
    }

    if (lastResult.result === "correct") {
      return `Correct. ${lastResult.guess} was the hidden number.`;
    }

    return `Your guess of ${lastResult.guess} is ${lastResult.result}.`;
  }, [lastResult]);

  const handleSubmitGuess = () => {
    const parsedGuess = Number(guess);

    if (!Number.isInteger(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      setErrorMessage("Enter a whole number between 1 and 100.");
      return;
    }

    const result: GuessFeedback =
      parsedGuess === secretNumber ? "correct" : parsedGuess < secretNumber ? "higher" : "lower";

    const entry = {
      guess: parsedGuess,
      result
    } satisfies PracticeGuessEntry;

    setLastResult(entry);
    setGuessHistory((currentHistory) => [entry, ...currentHistory].slice(0, 12));
    setGuess("");
    setErrorMessage(null);

    if (result === "correct") {
      setIsComplete(true);
    }
  };

  const handlePlayAgain = () => {
    setSecretNumber(randomNumber());
    setGuess("");
    setErrorMessage(null);
    setLastResult(null);
    setGuessHistory([]);
    setIsComplete(false);
  };

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Practice</Text>
        <Text style={styles.title}>Single Player</Text>
        <Text style={styles.subtitle}>
          The game picked a number from 1 to 100. Keep guessing until you find it.
        </Text>
      </View>

      <View style={styles.card}>
        <TextField
          editable={!isComplete}
          keyboardType="numeric"
          label="Your guess"
          maxLength={3}
          onChangeText={setGuess}
          placeholder={isComplete ? "Round complete" : "Pick a number"}
          value={guess}
        />

        <PrimaryButton
          disabled={isComplete}
          label={isComplete ? "Solved" : "Submit Guess"}
          onPress={handleSubmitGuess}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Latest feedback</Text>
        <Text style={styles.feedbackText}>{latestFeedback}</Text>
      </View>

      {isComplete ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>You found it in {guessHistory.length} guesses.</Text>
          <Text style={styles.successText}>Start a fresh practice round or head back home.</Text>
          <PrimaryButton label="Play Again" onPress={handlePlayAgain} />
        </View>
      ) : null}

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Previous guesses</Text>
        {guessHistory.length === 0 ? (
          <Text style={styles.feedbackText}>No guesses yet.</Text>
        ) : (
          guessHistory.map((entry, index) => (
            <Text key={`${entry.guess}-${index}`} style={styles.historyItem}>
              {entry.guess}
              {" -> "}
              {entry.result}
            </Text>
          ))
        )}
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
    fontSize: 36,
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
  successCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md
  },
  successTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  successText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});
