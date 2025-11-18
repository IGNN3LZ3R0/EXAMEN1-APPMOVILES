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
        // Parsear URL completa
        const parsedUrl = Linking.parse(url);
        console.log("📦 URL parseada (Linking.parse):", parsedUrl);
        
        // También intentar parsear con URL nativa para capturar hash
        let allParams: any = parsedUrl.queryParams || {};
        
        // Si la URL tiene un hash (#), los parámetros pueden estar ahí
        if (url.includes('#')) {
          const hashPart = url.split('#')[1];
          console.log("🔍 Hash encontrado:", hashPart);
          
          if (hashPart) {
            // Parsear parámetros del hash
            const hashParams = new URLSearchParams(hashPart);
            hashParams.forEach((value, key) => {
              allParams[key] = value;
            });
          }
        }
        
        // También parsear query params normales si existen
        if (url.includes('?')) {
          const queryPart = url.split('?')[1]?.split('#')[0];
          console.log("🔍 Query encontrada:", queryPart);
          
          if (queryPart) {
            const queryParams = new URLSearchParams(queryPart);
            queryParams.forEach((value, key) => {
              allParams[key] = value;
            });
          }
        }
        
        console.log("📋 Todos los parámetros combinados:", allParams);
        
        // Manejar tigoplanes://auth-callback
        if (parsedUrl.hostname === "auth-callback" || parsedUrl.path === "auth-callback") {
          console.log("🎯 Redirigiendo a callback con params:", allParams);
          
          router.push({
            pathname: "/auth/callback",
            params: allParams as any,
          });
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
  }, []);

  // Navegación basada en autenticación
  useEffect(() => {
    if (cargando) return;

    const enAuth = segments[0] === "auth";

    // Si hay usuario y está en auth (excepto callback y nueva-password), ir a tabs
    if (usuario && enAuth && segments[1] !== "callback" && segments[1] !== "nueva-password") {
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