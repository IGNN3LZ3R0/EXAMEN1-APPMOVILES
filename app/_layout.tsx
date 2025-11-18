import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useAuth } from "../src/presentation/hooks/useAuth";

export default function RootLayout() {
  const { usuario, cargando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Manejar deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("🔗 Deep link recibido:", url);
      
      try {
        // Extraer todos los parámetros de la URL (tanto query como hash)
        const allParams: Record<string, string> = {};
        
        // 1. Parsear query params normales (?param=value)
        if (url.includes('?')) {
          const queryPart = url.split('?')[1]?.split('#')[0];
          if (queryPart) {
            const queryParams = new URLSearchParams(queryPart);
            queryParams.forEach((value, key) => {
              allParams[key] = value;
            });
          }
        }
        
        // 2. Parsear hash params (#param=value)
        if (url.includes('#')) {
          const hashPart = url.split('#')[1];
          if (hashPart) {
            const hashParams = new URLSearchParams(hashPart);
            hashParams.forEach((value, key) => {
              allParams[key] = value;
            });
          }
        }
        
        console.log("📋 Parámetros extraídos:", allParams);
        
        // 3. Verificar si es callback de auth
        const isAuthCallback = 
          url.includes('auth-callback') || 
          url.includes('/auth/v1/verify') ||
          allParams.type === 'recovery' ||
          allParams.type === 'signup';
        
        if (isAuthCallback) {
          console.log("🎯 Redirigiendo a callback con params:", allParams);
          
          // Usar replace en lugar de push para evitar que el usuario vuelva atrás
          router.replace({
            pathname: "/auth/callback",
            params: allParams as any,
          });
        } else {
          console.log("ℹ️ Deep link no es de autenticación");
        }
      } catch (error) {
        console.error("❌ Error al parsear deep link:", error);
      }
    };

    // Escuchar deep links mientras la app está abierta
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🚀 App abierta con deep link:", url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Navegación basada en autenticación
  useEffect(() => {
    if (cargando) return;

    const enAuth = segments[0] === "auth";
    const enCallback = segments[1] === "callback";
    const enNuevaPassword = segments[1] === "nueva-password";

    // Si hay usuario y está en auth (excepto callback y nueva-password), ir a tabs
    if (usuario && enAuth && !enCallback && !enNuevaPassword) {
      console.log("📱 Usuario autenticado, redirigiendo a tabs");
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