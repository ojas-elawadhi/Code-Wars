import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { createRoom, joinRoom } from "../socket/socket";
import { useGameStore } from "../store/useGameStore";
import type { GameMode } from "../types/game.types";
import { colors, spacing } from "../utils/theme";

type RuleMode = "classic" | "duel";

export default function PrivateSetupScreen() {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [ruleMode, setRuleMode] = useState<RuleMode>("classic");
  const [loadingAction, setLoadingAction] = useState<"create" | "join" | null>(null);

  const isConnected = useGameStore((state) => state.isConnected);
  const errorMessage = useGameStore((state) => state.errorMessage);
  const setErrorMessage = useGameStore((state) => state.setErrorMessage);
  const setSession = useGameStore((state) => state.setSession);

  const privateGameMode: GameMode = ruleMode === "classic" ? "friends" : "versus";

  const handleCreateRoom = async () => {
    try {
      setLoadingAction("create");
      setErrorMessage(null);

      const response = await createRoom(playerName.trim(), privateGameMode);
      setSession(response.player, response.room, privateGameMode);
      router.replace("/lobby");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create room.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setLoadingAction("join");
      setErrorMessage(null);

      const response = await joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      setSession(response.player, response.room);
      router.replace("/lobby");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not join room.");
    } finally {
      setLoadingAction(null);
    }
  };

  const canCreate = playerName.trim().length >= 2;
  const canJoin = canCreate && roomId.trim().length >= 4;

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Private</Text>
        <Text style={styles.title}>Choose A Mode</Text>
        <Text style={styles.subtitle}>
          Pick the room style first, then create a private room or join one with a code.
        </Text>
      </View>

      <View style={styles.card}>
        <TextField
          autoCapitalize="words"
          label="Your name"
          onChangeText={setPlayerName}
          placeholder="Enter at least 2 characters"
          value={playerName}
        />

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setRuleMode("classic")}
            style={({ pressed }) => [
              styles.modeCard,
              ruleMode === "classic" && styles.modeCardActive,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Classic</Text>
            <Text style={styles.modeText}>2 to 6 players guess one shared hidden number.</Text>
          </Pressable>

          <Pressable
            onPress={() => setRuleMode("duel")}
            style={({ pressed }) => [
              styles.modeCard,
              ruleMode === "duel" && styles.modeCardActive,
              pressed && styles.modeCardPressed
            ]}
          >
            <Text style={styles.modeTitle}>Duel</Text>
            <Text style={styles.modeText}>2 players choose secret numbers and guess each other.</Text>
          </Pressable>
        </View>

        <PrimaryButton
          disabled={!canCreate}
          label={ruleMode === "classic" ? "Create Private Classic Room" : "Create Private Duel Room"}
          loading={loadingAction === "create"}
          onPress={handleCreateRoom}
        />
      </View>

      <View style={styles.card}>
        <TextField
          autoCapitalize="characters"
          label="Room code"
          maxLength={6}
          onChangeText={(value) => setRoomId(value.toUpperCase())}
          placeholder="Enter room code"
          value={roomId}
        />

        <PrimaryButton
          disabled={!canJoin}
          label="Join Private Room"
          loading={loadingAction === "join"}
          onPress={handleJoinRoom}
          variant="secondary"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.connection}>
          {isConnected ? "Server connected" : "Connecting to server..."}
        </Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
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
    fontSize: 40,
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
  modeRow: {
    gap: spacing.sm
  },
  modeCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xs
  },
  modeCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surface
  },
  modeCardPressed: {
    opacity: 0.9
  },
  modeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  footer: {
    gap: spacing.sm
  },
  connection: {
    color: colors.textMuted,
    fontSize: 13
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600"
  }
});
