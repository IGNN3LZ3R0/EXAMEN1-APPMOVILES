import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/data/services/supabaseClient";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/presentation/styles/theme";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const procesadoRef = useRef(false);

  useEffect(() => {
    if (procesadoRef.current) {
      console.log("⚠️ Callback ya procesado, ignorando...");
      return;
    }

    procesadoRef.current = true;
    procesarCallback();
  }, []);

  const procesarCallback = async () => {
    try {
      console.log("📥 Parámetros recibidos:", JSON.stringify(params, null, 2));

      const accessToken = params.access_token as string;
      const refreshToken = params.refresh_token as string;
      const type = (params.type || params.event_type) as string;
      const error = params.error as string;
      const errorDescription = params.error_description as string;

      // Verificar si hay error
      if (error) {
        console.error("❌ Error en callback:", error, errorDescription);
        throw new Error(errorDescription || error);
      }

      // CASO 1: Recuperación de contraseña con tokens completos
      if (accessToken && refreshToken && type === "recovery") {
        console.log("💾 Estableciendo sesión para recuperación de contraseña...");
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("❌ Error al establecer sesión:", sessionError);
          throw new Error("No se pudo establecer la sesión: " + sessionError.message);
        }

        console.log("✅ Sesión establecida para recuperación");
        
        // Redirigir a cambiar contraseña
        setTimeout(() => {
          router.replace("/auth/nueva-password");
        }, 500);
        return;
      }

      // CASO 2: Confirmación de email (signup)
      if (type === "signup" || type === "email") {
        console.log("✅ Email confirmado exitosamente");
        
        setTimeout(() => {
          router.replace({
            pathname: "/auth/login",
            params: {
              message: "Email confirmado. Ya puedes iniciar sesión.",
            },
          });
        }, 500);
        return;
      }

      // CASO 3: Si no hay información suficiente
      console.warn("⚠️ Callback sin información suficiente");
      throw new Error(
        "No se pudo procesar el enlace de autenticación. Por favor, intenta nuevamente."
      );

    } catch (error: any) {
      console.error("❌ Error en callback:", error);
      
      // Mostrar error y redirigir
      setTimeout(() => {
        router.replace({
          pathname: "/auth/login",
          params: {
            error: "callback_failed",
            message: error.message || "No se pudo procesar el enlace",
          },
        });
      }, 2000);
    }
  };

  return (
    <View style={globalStyles.containerCentered}>
      <View style={styles.iconContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      
      <Text style={styles.mensaje}>Procesando autenticación...</Text>
      
      <Text style={styles.submensaje}>
        Por favor espera un momento
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: spacing.xl,
  },
  mensaje: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  submensaje: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});