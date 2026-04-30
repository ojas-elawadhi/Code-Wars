import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { createRoom, joinRoom } from "../socket/socket";
import { useGameStore } from "../store/useGameStore";
import { colors, spacing } from "../utils/theme";

export default function HomeScreen() {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loadingAction, setLoadingAction] = useState<"create" | "join" | null>(null);

  const isConnected = useGameStore((state) => state.isConnected);
  const errorMessage = useGameStore((state) => state.errorMessage);
  const setErrorMessage = useGameStore((state) => state.setErrorMessage);
  const setSession = useGameStore((state) => state.setSession);

  const handleCreateRoom = async () => {
    try {
      setLoadingAction("create");
      setErrorMessage(null);

      const response = await createRoom(playerName.trim());
      setSession(response.player, response.room);
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
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Real-time multiplayer</Text>
        <Text style={styles.title}>Higher or Lower</Text>
        <Text style={styles.subtitle}>
          Create a room, invite friends, and take turns guessing through 10-second rounds until someone finds the hidden number.
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

        <PrimaryButton
          disabled={!canCreate}
          label="Create Room"
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
          label="Join Room"
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
  hero: {
    marginTop: spacing.xl,
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
