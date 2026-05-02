import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import type { GuessFeedback } from "../types/game.types";
import { colors, spacing } from "../utils/theme";

interface AiClassicRoundEntry {
  roundNumber: number;
  playerGuess: number;
  playerResult: GuessFeedback;
  aiGuess: number;
  aiResult: GuessFeedback;
}

type ClassicWinner = "player" | "ai" | "tie" | null;

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomNumber = () => randomBetween(1, 100);

const formatFeedback = (result: GuessFeedback) => {
  if (result === "higher") {
    return "Higher";
  }

  if (result === "lower") {
    return "Lower";
  }

  if (result === "correct") {
    return "Correct";
  }

  return "No Guess";
};

export default function VsAiClassicScreen() {
  const [targetNumber, setTargetNumber] = useState(randomNumber);
  const [guess, setGuess] = useState("");
  const [roundNumber, setRoundNumber] = useState(1);
  const [aiMin, setAiMin] = useState(1);
  const [aiMax, setAiMax] = useState(100);
  const [lastRound, setLastRound] = useState<AiClassicRoundEntry | null>(null);
  const [history, setHistory] = useState<AiClassicRoundEntry[]>([]);
  const [winner, setWinner] = useState<ClassicWinner>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isComplete = winner !== null;

  const latestFeedback = useMemo(() => {
    if (!lastRound) {
      return "You and the AI are chasing the same hidden number. Submit one guess each round and use the higher or lower hints to narrow it down.";
    }

    const playerLine = `Your guess ${lastRound.playerGuess}: ${formatFeedback(lastRound.playerResult)}`;
    const aiLine = `AI guess ${lastRound.aiGuess}: ${formatFeedback(lastRound.aiResult)}`;

    return `${playerLine} ${aiLine}`;
  }, [lastRound]);

  const handleSubmitGuess = () => {
    const parsedGuess = Number(guess);

    if (!Number.isInteger(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      setErrorMessage("Enter a whole number between 1 and 100.");
      return;
    }

    const playerResult: GuessFeedback =
      parsedGuess === targetNumber ? "correct" : parsedGuess < targetNumber ? "higher" : "lower";
    const aiGuess = randomBetween(aiMin, aiMax);
    const aiResult: GuessFeedback =
      aiGuess === targetNumber ? "correct" : aiGuess < targetNumber ? "higher" : "lower";

    const roundEntry: AiClassicRoundEntry = {
      roundNumber,
      playerGuess: parsedGuess,
      playerResult,
      aiGuess,
      aiResult
    };

    setLastRound(roundEntry);
    setHistory((currentHistory) => [roundEntry, ...currentHistory].slice(0, 12));
    setGuess("");
    setErrorMessage(null);

    if (playerResult === "correct" && aiResult === "correct") {
      setWinner("tie");
      return;
    }

    if (playerResult === "correct") {
      setWinner("player");
      return;
    }

    if (aiResult === "correct") {
      setWinner("ai");
      return;
    }

    if (aiResult === "higher") {
      setAiMin(aiGuess + 1);
    } else if (aiResult === "lower") {
      setAiMax(aiGuess - 1);
    }

    setRoundNumber((currentRound) => currentRound + 1);
  };

  const handlePlayAgain = () => {
    setTargetNumber(randomNumber());
    setGuess("");
    setRoundNumber(1);
    setAiMin(1);
    setAiMax(100);
    setLastRound(null);
    setHistory([]);
    setWinner(null);
    setErrorMessage(null);
  };

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>VS AI Classic</Text>
        <Text style={styles.title}>Race To The Number</Text>
        <Text style={styles.subtitle}>
          You and the AI are guessing the same hidden number from 1 to 100. Whoever finds it first wins.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.roundHeader}>
          <Text style={styles.roundTitle}>Round {roundNumber}</Text>
          <Text style={styles.roundMeta}>AI range: {aiMin} - {aiMax}</Text>
        </View>

        <Text style={styles.status}>
          {isComplete
            ? winner === "tie"
              ? "You and the AI both found the number in the same round."
              : winner === "player"
                ? "You reached the hidden number first."
                : "The AI reached the hidden number first."
            : "Lock in your guess and the AI will respond with one of its own."}
        </Text>

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
          label={isComplete ? "Classic Finished" : "Lock In Guess"}
          onPress={handleSubmitGuess}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Latest feedback</Text>
        <Text style={styles.feedbackText}>{latestFeedback}</Text>
      </View>

      {isComplete ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            {winner === "tie"
              ? "It's a tie."
              : winner === "player"
                ? "You win."
                : "AI wins."}
          </Text>
          <Text style={styles.resultText}>
            {winner === "tie"
              ? "Both guesses hit the shared hidden number in the same round."
              : winner === "player"
                ? "You read the hints faster than the AI this time."
                : "The AI narrowed the shared target down before you did."}
          </Text>
          <PrimaryButton label="Play Again" onPress={handlePlayAgain} />
        </View>
      ) : null}

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Round history</Text>
        {history.length === 0 ? (
          <Text style={styles.feedbackText}>No rounds yet.</Text>
        ) : (
          history.map((entry) => (
            <View key={entry.roundNumber} style={styles.historyRow}>
              <Text style={styles.historyRound}>Round {entry.roundNumber}</Text>
              <Text style={styles.historyText}>
                You: {entry.playerGuess}
                {" -> "}
                {entry.playerResult}
              </Text>
              <Text style={styles.historyText}>
                AI: {entry.aiGuess}
                {" -> "}
                {entry.aiResult}
              </Text>
            </View>
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
  roundHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  roundTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  roundMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  status: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
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
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md
  },
  resultTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800"
  },
  resultText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  historyRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs
  },
  historyRound: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  historyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});
