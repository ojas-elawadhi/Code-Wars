import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlayerList } from "../components/PlayerList";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useOnlineGameStore } from "../store/useOnlineGameStore";
import { colors, spacing } from "../utils/theme";

export default function OnlineResultScreen() {
  const player = useOnlineGameStore((state) => state.player);
  const room = useOnlineGameStore((state) => state.room);
  const resetRoundState = useOnlineGameStore((state) => state.resetRoundState);

  useEffect(() => {
    if (!player || !room) {
      router.replace("/");
      return;
    }

    if (room.gameState === "playing") {
      router.replace("/online-game");
    }
  }, [player, room]);

  if (!room || !player) {
    return null;
  }

  const winnerIds = room.winnerIds ?? [];
  const winners = room.players.filter((currentPlayer) => winnerIds.includes(currentPlayer.id));
  const winner = room.players.find((currentPlayer) => currentPlayer.id === room.winner) ?? null;
  const isTie = winners.length > 1;

  const handlePlayAgain = () => {
    resetRoundState();
    router.replace("/online-lobby");
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.label}>Game finished</Text>
        <Text style={styles.title}>
          {isTie ? "It's a tie!" : winner ? `${winner.name} wins!` : "Game complete"}
        </Text>
        <Text style={styles.subtitle}>
          {isTie
            ? "Both players guessed correctly in the same round."
            : winner
            ? "Head back to the lobby and start another round when everyone is ready."
            : "The round ended without a recorded winner."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Players</Text>
        <PlayerList hostId={room.hostId} players={room.players} winnerId={room.winner} winnerIds={winnerIds} />
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
