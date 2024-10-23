// Importerer nødvendige komponenter og providere
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ErrorBoundary from "react-native-error-boundary";

// Definerer hovedlayoutet for applikationen
export default function RootLayout() {
  return (
    // Wrapper hele appen i en ErrorBoundary for at håndtere fejl
    <ErrorBoundary>
      {/* Giver mulighed for at bruge action sheets i appen */}
      <ActionSheetProvider>
        {/* Håndterer gesture-baserede interaktioner */}
        <GestureHandlerRootView>
          {/* Definerer navigationsstrukturen med Stack */}
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: "#fff", // Sætter baggrundsfarven for alle skærme
              },
            }}
          >
            {/* Definerer forskellige skærme i appen */}
            <Stack.Screen
              options={{
                headerShown: false, // Skjuler header for denne skærm
              }}
              name="index"
            />
            <Stack.Screen
              options={{
                headerShown: false,
              }}
              name="read-story/[uid]"
            />
            <Stack.Screen
              options={{
                headerShown: false,
              }}
              name="search"
            />
            <Stack.Screen
              options={{
                headerShown: false,
              }}
              name="saved"
            />
            <Stack.Screen
              options={{
                headerShown: false,
              }}
              name="history"
            />
          </Stack>
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </ErrorBoundary>
  );
}
