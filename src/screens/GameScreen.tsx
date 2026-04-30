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
  const [currentTime, setCurrentTime] = useState(Date.now());

  const player = useGameStore((state) => state.player);
  const room = useGameStore((state) => state.room);
  const lastGuessResult = useGameStore((state) => state.lastGuessResult);
  const guessHistory = useGameStore((state) => state.guessHistory);
  const errorMessage = useGameStore((state) => state.errorMessage);
  const setErrorMessage = useGameStore((state) => state.setErrorMessage);

  useEffect(() => {
    if (!player || !room) {
      router.replace("/");
      return;
    }

    if (room.gameState === "finished") {
      router.replace("/result");
    }
  }, [player, room]);

  useEffect(() => {
    if (room?.roundStatus !== "collecting" || !room.roundEndsAt) {
      setCurrentTime(Date.now());
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [room?.roundEndsAt, room?.roundStatus]);

  useEffect(() => {
    setErrorMessage(null);
  }, [room?.roundNumber, room?.roundStatus, setErrorMessage]);

  const latestFeedback = !lastGuessResult
    ? "Submit one number this round to get higher, lower, or correct feedback when the timer ends."
    : lastGuessResult.result === "missed"
      ? `You missed round ${lastGuessResult.roundNumber}.`
      : `Round ${lastGuessResult.roundNumber}: your guess of ${lastGuessResult.guess} is ${lastGuessResult.result}.`;

  if (!room || !player) {
    return null;
  }

  const hasSubmitted = room.submittedPlayerIds.includes(player.id);
  const isCollecting = room.roundStatus === "collecting";
  const secondsRemaining = room.roundEndsAt
    ? Math.max(0, Math.ceil((room.roundEndsAt - currentTime) / 1000))
    : 0;

  const handleSubmitGuess = async () => {
    if (!isCollecting) {
      setErrorMessage("Wait for the next round to start.");
      return;
    }

    if (hasSubmitted) {
      setErrorMessage("You already locked in a guess this round.");
      return;
    }

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
        <Text style={styles.subtitle}>
          Each round lasts {room.roundDurationSeconds} seconds. Submit one number from 1 to 100 before time runs out.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.roundHeader}>
          <Text style={styles.roundTitle}>Round {room.roundNumber}</Text>
          <Text style={styles.timer}>
            {isCollecting ? `${secondsRemaining}s left` : "Checking guesses..."}
          </Text>
        </View>
        <Text style={styles.status}>
          {isCollecting
            ? hasSubmitted
              ? "Your guess is locked in for this round."
              : "You can submit one guess this round."
            : "Round closed. Feedback is on the way."}
        </Text>
        <TextField
          editable={isCollecting && !hasSubmitted}
          keyboardType="numeric"
          label="Your guess"
          maxLength={3}
          onChangeText={setGuess}
          placeholder={isCollecting && !hasSubmitted ? "Pick a number" : "Wait for the next round"}
          value={guess}
        />
        <PrimaryButton
          disabled={!isCollecting || hasSubmitted}
          label={hasSubmitted ? "Guess Submitted" : "Lock In Guess"}
          loading={isSubmitting}
          onPress={handleSubmitGuess}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Latest feedback</Text>
        <Text style={styles.feedbackText}>{latestFeedback}</Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.sectionTitle}>Previous guesses</Text>
        {guessHistory.length === 0 ? (
          <Text style={styles.feedbackText}>No guesses yet.</Text>
        ) : (
          guessHistory.map((entry, index) => (
            <Text key={`${entry.roundNumber}-${entry.guess ?? "missed"}-${index}`} style={styles.historyItem}>
              Round {entry.roundNumber}
              {": "}
              {entry.guess === null ? "missed" : `${entry.guess} -> ${entry.result}`}
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
  timer: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "800"
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
