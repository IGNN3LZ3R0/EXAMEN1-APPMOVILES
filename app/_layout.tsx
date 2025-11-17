import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/presentation/hooks/useAuth";

export default function RootLayout() {
  const { usuario, cargando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    const enAuth = segments[0] === "auth";
    const enTabs = segments[0] === "(tabs)";
    const enPlan = segments[0] === "plan";

    // PERMITIR acceso sin login a:
    // - Auth (login, registro)
    // - Tabs (solo ver catálogo)
    // - Plan detalle (solo lectura)
    
    // Si HAY usuario y está en auth → Redirigir a tabs
    if (usuario && enAuth) {
      router.replace("/(tabs)");
    }
  }, [usuario, segments, cargando]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="plan" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}