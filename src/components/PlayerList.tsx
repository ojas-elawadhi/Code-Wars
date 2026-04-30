import { StyleSheet, Text, View } from "react-native";

import type { Player } from "../types/game.types";
import { colors, spacing } from "../utils/theme";

interface PlayerListProps {
  players: Player[];
  hostId: string;
  winnerId?: string | null;
  winnerIds?: string[];
}

export function PlayerList({ players, hostId, winnerId, winnerIds = [] }: PlayerListProps) {
  return (
    <View style={styles.container}>
      {players.map((player) => {
        const isHost = player.id === hostId;
        const isWinner = winnerIds.includes(player.id) || player.id === winnerId;

        return (
          <View key={player.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{player.name}</Text>
              <Text style={styles.meta}>{isHost ? "Host" : "Player"}</Text>
            </View>
            {isWinner ? <Text style={styles.badge}>Winner</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4
  },
  badge: {
    color: colors.success,
    fontWeight: "700"
  }
});
