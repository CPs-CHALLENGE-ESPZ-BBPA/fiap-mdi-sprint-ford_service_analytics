import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#003C71" }}>
      {/* Azul escuro Ford */}
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#003C71", // Azul escuro Ford
          },
          headerTintColor: "#FFFFFF", // Branco para o título do cabeçalho
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#F4F4F4",  // Cor neutra para o fundo da tela
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerStyle: {
              backgroundColor: "#0061A8", // Azul claro Ford
            },
            headerTintColor: "#FFFFFF", // Texto branco para contraste
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            title: "Sobre",
            headerStyle: {
              backgroundColor: "#0061A8", // Azul claro Ford
            },
            headerTintColor: "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerStyle: {
              backgroundColor: "#0061A8", // Azul claro Ford
            },
            headerTintColor: "#FFFFFF",
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            title: "Perfil",
            headerStyle: {
              backgroundColor: "#0061A8", // Azul claro Ford
            },
            headerTintColor: "#FFFFFF",
          }}
        />
      </Stack>
    </View>
  );
}