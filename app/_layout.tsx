import { Stack } from "expo-router";
import { useEffect } from "react";

import { connectSocket } from "../src/socket/onlineSocket";

export default function RootLayout() {
  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#08111f"
        }
      }}
    />
  );
}
