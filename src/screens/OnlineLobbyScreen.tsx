import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { PlayerList } from "../components/PlayerList";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { leaveRoom, startGame } from "../socket/onlineSocket";
import { useOnlineGameStore } from "../store/useOnlineGameStore";
import { colors, spacing } from "../utils/theme";
import { DIFFICULTY_CONFIG, getDifficultyRangeLabel } from "../../shared/difficulty";

export default function OnlineLobbyScreen() {
  const [isStarting, setIsStarting] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  const player = useOnlineGameStore((state) => state.player);
  const room = useOnlineGameStore((state) => state.room);
  const errorMessage = useOnlineGameStore((state) => state.errorMessage);
  const setErrorMessage = useOnlineGameStore((state) => state.setErrorMessage);
  const resetAll = useOnlineGameStore((state) => state.resetAll);

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
      router.replace("/online-game");
    }
  }, [player, room]);

  if (!room || !player) {
    return null;
  }

  const winnerIds = room.winnerIds ?? [];
  const mode = room.mode ?? "classic";
  const difficulty = room.difficulty ?? "easy";
  const maxNumber = room.maxNumber ?? DIFFICULTY_CONFIG[difficulty].maxNumber;
  const maxPlayers = room.maxPlayers ?? (mode === "duel" ? 2 : 6);
  const lastWinner = room.players.find((currentPlayer) => currentPlayer.id === room.winner);
  const hasTie = winnerIds.length > 1;
  const canStart = mode === "duel" ? room.players.length === 2 : room.players.length >= 2;
  const roomModeLabel = `${mode === "duel" ? "Online Duel" : "Online Classic"} • ${DIFFICULTY_CONFIG[difficulty].label}`;
  const infoMessage =
    mode === "duel"
      ? room.players.length < 2
        ? room.players.length === 1
          ? "Waiting for other player to join the duel."
          : "Duel mode needs exactly 2 players before the host can start."
        : `Each player chooses a secret number in the 1-${maxNumber} range, then both players get one guess per 15-second round to crack the other number.`
      : room.players.length < 2
        ? "At least 2 players are needed to start."
        : `Everyone gets one guess per 15-second round in the ${getDifficultyRangeLabel(difficulty)} range. After each round, players learn whether their guess was higher or lower.`;

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

  const handleBackToHome = async () => {
    try {
      setErrorMessage(null);
      await leaveRoom(room.roomId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not leave the room.");
      return;
    }

    resetAll();
    router.replace("/");
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(room.roomId);
    setCopySuccessMessage("Code copied");
  };

  const handleShareCode = async () => {
    await Share.share({
      message: `Join my Higher or Lower online room with code: ${room.roomId}`
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.label}>Lobby</Text>
        <Text style={styles.mode}>{roomModeLabel}</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{room.roomId}</Text>
          <View style={styles.codeActions}>
            <Pressable
              accessibilityLabel="Copy room code"
              onPress={handleCopyCode}
              style={({ pressed }) => [styles.codeAction, pressed && styles.codeActionPressed]}
            >
              <Ionicons color={colors.text} name="copy-outline" size={18} />
            </Pressable>
            <Pressable
              accessibilityLabel="Share room code"
              onPress={handleShareCode}
              style={({ pressed }) => [styles.codeAction, pressed && styles.codeActionPressed]}
            >
              <Ionicons color={colors.text} name="share-social-outline" size={18} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.copy}>Share this code so other players can join.</Text>
        {copySuccessMessage ? <Text style={styles.copySuccess}>{copySuccessMessage}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players</Text>
        {mode === "classic" ? <Text style={styles.copy}>{room.players.length}/{maxPlayers} joined</Text> : null}
        <PlayerList hostId={room.hostId} players={room.players} winnerId={room.winner} winnerIds={winnerIds} />
      </View>

      {hasTie ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Last result: tie game.</Text>
        </View>
      ) : lastWinner ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Last winner: {lastWinner.name}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.info}>{infoMessage}</Text>

        {isHost ? (
          <PrimaryButton
            disabled={!canStart}
            label="Start Game"
            loading={isStarting}
            onPress={handleStartGame}
          />
        ) : (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Waiting for the host to start the match.</Text>
          </View>
        )}

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <PrimaryButton
          label="Back to Home"
          onPress={handleBackToHome}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.lg,
    gap: spacing.xs
  },
  codeRow: {
    gap: spacing.sm
  },
  label: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  mode: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  code: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800"
  },
  codeActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  codeAction: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42
  },
  codeActionPressed: {
    opacity: 0.85
  },
  copy: {
    color: colors.textMuted,
    fontSize: 15
  },
  copySuccess: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "600"
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
