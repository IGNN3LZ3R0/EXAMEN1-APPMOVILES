import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/presentation/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/presentation/hooks/useAuth";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuario, esAsesor } = useAuth();

  // Si no hay usuario, solo mostrar el tab de Planes
  if (!usuario) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          headerShown: false,
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Planes",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "phone-portrait" : "phone-portrait-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />
        
        {/* Ocultar otros tabs para invitados */}
        <Tabs.Screen
          name="contrataciones"
          options={{
            href: null, // Ocultar este tab
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null, // Ocultar este tab
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      {/* TAB 1: PLANES / HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Planes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "phone-portrait" : "phone-portrait-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* TAB 2: CONTRATACIONES O CREAR PLAN (según el rol) */}
      <Tabs.Screen
        name="contrataciones"
        options={{
          title: esAsesor ? "Solicitudes" : "Mis Planes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                esAsesor
                  ? focused
                    ? "clipboard"
                    : "clipboard-outline"
                  : focused
                  ? "checkmark-done-circle"
                  : "checkmark-done-circle-outline"
              }
              size={28}
              color={color}
            />
          ),
        }}
        listeners={
          esAsesor
            ? undefined // Para asesores, navegación normal a solicitudes
            : undefined // Para usuarios, navegación normal a mis contrataciones
        }
      />

      {/* TAB 3: CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubble-ellipses"
                  : "chatbubble-ellipses-outline"
              }
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}