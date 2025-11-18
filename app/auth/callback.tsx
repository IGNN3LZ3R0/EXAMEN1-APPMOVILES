import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useAuth } from "../../src/presentation/hooks/useAuth";

export default function RootLayout() {
  const { usuario, cargando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Manejar deep links y URLs de Supabase
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("🔗 URL recibida:", url);
      
      // Parsear URL
      const parsedUrl = Linking.parse(url);
      console.log("📦 URL parseada:", parsedUrl);
      
      // Caso 1: URL de Supabase (https://byttvwsfelhilmgpjvdj.supabase.co/auth/v1/verify)
      if (url.includes('supabase.co/auth/v1/verify')) {
        // Extraer parámetros de la URL de Supabase
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        const type = urlObj.searchParams.get('type');
        const redirectTo = urlObj.searchParams.get('redirect_to');
        
        console.log("✉️ Parámetros Supabase:", { token, type, redirectTo });
        
        // Navegar al callback con los parámetros
        router.push({
          pathname: "/auth/callback",
          params: {
            token: token || '',
            type: type || '',
            access_token: token || '', // Supabase usa el token como access_token
          } as any,
        });
        return;
      }
      
      // Caso 2: Deep link directo (tigoplanes://auth-callback)
      if (parsedUrl.hostname === "auth-callback" || parsedUrl.path === "auth-callback" || parsedUrl.path === "/auth/callback") {
        const params = parsedUrl.queryParams || {};
        console.log("🎯 Navegando a callback con params:", params);
        router.push({
          pathname: "/auth/callback",
          params: params as any,
        });
      }
    };

    // Escuchar deep links mientras la app está abierta
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🚀 App abierta con URL:", url);
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

    // Si HAY usuario y está en auth → Redirigir a tabs
    // Excepto si está en callback o nueva-password
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