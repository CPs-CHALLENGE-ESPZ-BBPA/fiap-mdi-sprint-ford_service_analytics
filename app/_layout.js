import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Platform } from "react-native";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Ford Service Analytics",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0061A8",
        });
      }
      if (Platform.OS !== "web") {
        await Notifications.requestPermissionsAsync();
      }
    };
    setup();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#001E3C" }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0061A8" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
          contentStyle: { backgroundColor: "#001E3C" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="nova-conta" options={{ title: "Criar Conta" }} />
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
        <Stack.Screen name="cadastro" options={{ title: "Cadastrar Veículo" }} />
        <Stack.Screen name="registros" options={{ title: "Dashboard" }} />
        <Stack.Screen name="fidelidade" options={{ title: "Programa de Fidelidade" }} />
      </Stack>
    </View>
  );
}
