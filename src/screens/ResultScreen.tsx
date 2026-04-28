import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlayerList } from "../components/PlayerList";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useGameStore } from "../store/useGameStore";
import { colors, spacing } from "../utils/theme";

export default function ResultScreen() {
  const { player, room, resetRoundState } = useGameStore((state) => ({
    player: state.player,
    room: state.room,
    resetRoundState: state.resetRoundState
  }));

  useEffect(() => {
    if (!player || !room) {
      router.replace("/");
      return;
    }

    if (room.gameState === "playing") {
      router.replace("/game");
    }
  }, [player, room]);

  if (!room || !player) {
    return null;
  }

  const winner = room.players.find((currentPlayer) => currentPlayer.id === room.winner) ?? null;

  const handlePlayAgain = () => {
    resetRoundState();
    router.replace("/lobby");
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.label}>Round finished</Text>
        <Text style={styles.title}>{winner ? `${winner.name} wins!` : "Round complete"}</Text>
        <Text style={styles.subtitle}>
          {winner
            ? "Head back to the lobby and start another round when everyone is ready."
            : "The round ended without a recorded winner."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Players</Text>
        <PlayerList hostId={room.hostId} players={room.players} winnerId={room.winner} />
      </View>

      <PrimaryButton label="Play Again" onPress={handlePlayAgain} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    gap: spacing.sm
  },
  label: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 34,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  }
});

