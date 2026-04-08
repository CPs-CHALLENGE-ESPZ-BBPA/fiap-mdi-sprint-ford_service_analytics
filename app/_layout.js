import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#000000",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerStyle: {
              backgroundColor: "#ED145B",
            },
            headerTintColor: "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            title: "Sobre",
          }}
        />

        <Stack.Screen
          name="login"
          options={{
              title: "Login",
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            title: "Perfil",
          }}
        />

      </Stack>
    </View>
  );
}