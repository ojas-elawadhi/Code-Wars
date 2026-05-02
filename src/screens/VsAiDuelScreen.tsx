import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import type { GuessFeedback } from "../types/game.types";
import { colors, spacing } from "../utils/theme";

interface AiDuelRoundEntry {
  roundNumber: number;
  playerGuess: number;
  playerResult: GuessFeedback;
  aiGuess: number;
  aiResult: GuessFeedback;
}

type DuelWinner = "player" | "ai" | "tie" | null;

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const formatPlayerHint = (result: GuessFeedback) => {
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

const formatAiLine = (entry: AiDuelRoundEntry) => {
  if (entry.aiResult === "correct") {
    return `AI guessed ${entry.aiGuess} and found your number.`;
  }

  return `AI guessed ${entry.aiGuess}.`;
};

export default function VsAiDuelScreen() {
  const [playerSecretInput, setPlayerSecretInput] = useState("");
  const [playerSecretNumber, setPlayerSecretNumber] = useState<number | null>(null);
  const [aiSecretNumber, setAiSecretNumber] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [roundNumber, setRoundNumber] = useState(1);
  const [aiMin, setAiMin] = useState(1);
  const [aiMax, setAiMax] = useState(100);
  const [lastRound, setLastRound] = useState<AiDuelRoundEntry | null>(null);
  const [history, setHistory] = useState<AiDuelRoundEntry[]>([]);
  const [winner, setWinner] = useState<DuelWinner>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSetup = playerSecretNumber === null || aiSecretNumber === null;
  const isComplete = winner !== null;

  const latestFeedback = useMemo(() => {
    if (!lastRound) {
      return "Choose your secret number, then guess the AI's hidden number while it tries to crack yours.";
    }

    const playerLine = `Your guess ${lastRound.playerGuess}: ${formatPlayerHint(lastRound.playerResult)}`;
    const aiLine = formatAiLine(lastRound);

    return `${playerLine} ${aiLine}`;
  }, [lastRound]);

  const handleStartDuel = () => {
    const parsedSecretNumber = Number(playerSecretInput);

    if (!Number.isInteger(parsedSecretNumber) || parsedSecretNumber < 1 || parsedSecretNumber > 100) {
      setErrorMessage("Enter a whole number between 1 and 100 for your secret number.");
      return;
    }

    setPlayerSecretNumber(parsedSecretNumber);
    setAiSecretNumber(randomBetween(1, 100));
    setGuess("");
    setRoundNumber(1);
    setAiMin(1);
    setAiMax(100);
    setLastRound(null);
    setHistory([]);
    setWinner(null);
    setErrorMessage(null);
  };

  const handleSubmitGuess = () => {
    if (playerSecretNumber === null || aiSecretNumber === null) {
      return;
    }

    const parsedGuess = Number(guess);

    if (!Number.isInteger(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      setErrorMessage("Enter a whole number between 1 and 100.");
      return;
    }

    const playerResult: GuessFeedback =
      parsedGuess === aiSecretNumber ? "correct" : parsedGuess < aiSecretNumber ? "higher" : "lower";
    const aiGuess = randomBetween(aiMin, aiMax);
    const aiResult: GuessFeedback =
      aiGuess === playerSecretNumber ? "correct" : aiGuess < playerSecretNumber ? "higher" : "lower";

    const roundEntry: AiDuelRoundEntry = {
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
    setPlayerSecretInput("");
    setPlayerSecretNumber(null);
    setAiSecretNumber(null);
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
        <Text style={styles.eyebrow}>VS AI Duel</Text>
        <Text style={styles.title}>{isSetup ? "Choose Your Secret Number" : "Guess The AI's Number"}</Text>
        <Text style={styles.subtitle}>
          {isSetup
            ? "Pick a number from 1 to 100. The AI will protect one too, and both of you will start guessing each round."
            : "Each round, you guess the AI's number and the AI guesses yours using higher or lower hints."}
        </Text>
      </View>

      {playerSecretNumber !== null ? (
        <View style={styles.secretBanner}>
          <Text style={styles.secretBannerLabel}>Your secret number</Text>
          <Text style={styles.secretBannerValue}>{playerSecretNumber}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {isSetup ? (
          <>
            <TextField
              keyboardType="numeric"
              label="Your secret number"
              maxLength={3}
              onChangeText={setPlayerSecretInput}
              placeholder="Pick a secret number"
              value={playerSecretInput}
            />

            <PrimaryButton label="Start Duel" onPress={handleStartDuel} />
          </>
        ) : (
          <>
            <View style={styles.roundHeader}>
              <Text style={styles.roundTitle}>Round {roundNumber}</Text>
              <Text style={styles.roundMeta}>AI range: {aiMin} - {aiMax}</Text>
            </View>

            <Text style={styles.status}>
              {isComplete
                ? winner === "tie"
                  ? "Both guesses landed on target in the same round."
                  : winner === "player"
                    ? "You cracked the AI's number first."
                    : "The AI found your number first."
                : "Lock in one guess and the AI will respond with a guess of its own."}
            </Text>

            <TextField
              editable={!isComplete}
              keyboardType="numeric"
              label="Your guess for the AI"
              maxLength={3}
              onChangeText={setGuess}
              placeholder={isComplete ? "Round complete" : "Guess the AI number"}
              value={guess}
            />

            <PrimaryButton
              disabled={isComplete}
              label={isComplete ? "Duel Finished" : "Lock In Guess"}
              onPress={handleSubmitGuess}
            />
          </>
        )}

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
              ? "You both guessed correctly in the same round."
              : winner === "player"
                ? "Your higher and lower reads beat the AI this time."
                : "The AI narrowed your number down before you finished the chase."}
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
                <Text style={styles.historyText}>AI: {entry.aiGuess}</Text>
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
  secretBanner: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4
  },
  secretBannerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  secretBannerValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
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
