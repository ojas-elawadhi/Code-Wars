import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlayerList } from "../components/PlayerList";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { startGame } from "../socket/socket";
import { useGameStore } from "../store/useGameStore";
import { colors, spacing } from "../utils/theme";

export default function LobbyScreen() {
  const [isStarting, setIsStarting] = useState(false);

  const player = useGameStore((state) => state.player);
  const room = useGameStore((state) => state.room);
  const errorMessage = useGameStore((state) => state.errorMessage);
  const setErrorMessage = useGameStore((state) => state.setErrorMessage);

  const isHost = useMemo(() => {
    if (!player || !room) {
      return false;
    }

    return room.hostId === player.id;
  }, [player, room]);

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

  const lastWinner = room.players.find((currentPlayer) => currentPlayer.id === room.winner);

  const handleStartGame = async () => {
    try {
      setIsStarting(true);
      setErrorMessage(null);
      await startGame(room.roomId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not start the game.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.label}>Lobby</Text>
        <Text style={styles.code}>{room.roomId}</Text>
        <Text style={styles.copy}>Share this code so other players can join.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players</Text>
        <PlayerList hostId={room.hostId} players={room.players} winnerId={room.winner} />
      </View>

      {lastWinner ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Last winner: {lastWinner.name}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.info}>
          {room.players.length < 2
            ? "At least 2 players are needed to start."
            : "Everyone guesses at the same time. First correct guess wins."}
        </Text>

        {isHost ? (
          <PrimaryButton
            disabled={room.players.length < 2}
            label="Start Game"
            loading={isStarting}
            onPress={handleStartGame}
          />
        ) : (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Waiting for the host to start the round.</Text>
          </View>
        )}

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
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
  code: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800"
  },
  copy: {
    color: colors.textMuted,
    fontSize: 15
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  notice: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md
  },
  noticeText: {
    color: colors.text,
    fontSize: 14
  },
  info: {
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
