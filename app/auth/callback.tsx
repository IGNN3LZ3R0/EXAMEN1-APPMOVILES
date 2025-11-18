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
    // Evitar procesamiento duplicado
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

      // Extraer tokens de diferentes formatos
      const accessToken = params.access_token as string;
      const refreshToken = params.refresh_token as string;
      const tokenHash = params.token_hash as string;
      const type = (params.type || params.event_type) as string;

      console.log("🔍 Tokens encontrados:", {
        accessToken: accessToken ? "✓" : "✗",
        refreshToken: refreshToken ? "✓" : "✗",
        tokenHash: tokenHash ? "✓" : "✗",
        type,
      });

      // CASO 1: Recuperación de contraseña con access_token y refresh_token
      if (accessToken && refreshToken) {
        console.log("💾 Estableciendo sesión con tokens completos...");
        
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("❌ Error al establecer sesión:", error);
          throw new Error("No se pudo establecer la sesión: " + error.message);
        }

        console.log("✅ Sesión establecida exitosamente");
        
        // Redirigir a cambiar contraseña después de un momento
        setTimeout(() => {
          router.replace("/auth/nueva-password");
        }, 500);
        return;
      }

      // CASO 2: Token hash (para verificación o recuperación)
      if (tokenHash) {
        console.log("🔐 Verificando token hash...");
        
        let otpType: 'signup' | 'recovery' | 'email' = 'email';
        
        if (type === "recovery" || type === "password_recovery") {
          otpType = 'recovery';
        } else if (type === "signup" || type === "email") {
          otpType = 'signup';
        }

        console.log("📝 Tipo de OTP:", otpType);

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (error) {
          console.error("❌ Error al verificar OTP:", error);
          throw new Error("Token inválido o expirado: " + error.message);
        }

        console.log("✅ OTP verificado:", data);
        
        if (otpType === 'recovery') {
          setTimeout(() => {
            router.replace("/auth/nueva-password");
          }, 500);
        } else {
          setTimeout(() => {
            router.replace("/auth/login");
          }, 500);
        }
        return;
      }

      // CASO 3: Ningún token válido encontrado
      throw new Error(
        "No se encontraron tokens válidos en los parámetros. " +
        "Parámetros recibidos: " + Object.keys(params).join(", ")
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