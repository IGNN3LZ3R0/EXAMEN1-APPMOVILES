import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/data/services/supabaseClient";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/presentation/styles/theme";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [procesando, setProcesando] = useState(true);
  const [mensaje, setMensaje] = useState("Procesando autenticación...");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [yaProcesoRef, setYaProceso] = useState(false);

  useEffect(() => {
    if (!yaProcesoRef) {
      setYaProceso(true);
      procesarCallback();
    }
  }, []);

  const procesarCallback = async () => {
    try {
      const debugData = JSON.stringify(params, null, 2);
      setDebugInfo(debugData);
      console.log("📥 Todos los parámetros recibidos:", debugData);

      // Intentar extraer todos los posibles formatos de token
      const token = params.token || 
                   params.access_token || 
                   params.token_hash ||
                   params.confirmation_token ||
                   params.recovery_token;
                   
      const type = params.type || params.token_type || params.event_type;
      const refreshToken = params.refresh_token;

      console.log("🔍 Valores extraídos:");
      console.log("  - Token:", token ? "✓ Presente" : "✗ Ausente");
      console.log("  - Type:", type);
      console.log("  - Refresh Token:", refreshToken ? "✓ Presente" : "✗ Ausente");

      // Si tenemos access_token y refresh_token, intentar establecer la sesión directamente
      if (token && refreshToken) {
        console.log("💾 Intentando establecer sesión con tokens...");
        setMensaje("Estableciendo sesión...");
        
        const { data, error } = await supabase.auth.setSession({
          access_token: token as string,
          refresh_token: refreshToken as string,
        });

        if (error) {
          console.error("❌ Error al establecer sesión:", error);
          throw error;
        }

        console.log("✅ Sesión establecida correctamente");
        
        // Verificar si necesita cambiar contraseña
        if (type === "recovery" || type === "password_recovery") {
          setTimeout(() => {
            router.replace("/auth/nueva-password");
          }, 500);
        } else {
          Alert.alert(
            "¡Autenticación Exitosa!",
            "Tu sesión ha sido establecida correctamente.",
            [
              {
                text: "Continuar",
                onPress: () => router.replace("/(tabs)"),
              },
            ]
          );
        }
        return;
      }

      // Si solo tenemos token_hash, usar verifyOtp
      if (token && !refreshToken) {
        console.log("🔐 Intentando verificar OTP...");
        
        // Determinar el tipo de verificación
        let otpType: 'signup' | 'recovery' | 'email' = 'email';
        
        if (type === "recovery" || type === "password_recovery") {
          otpType = 'recovery';
          setMensaje("Verificando enlace de recuperación...");
        } else if (type === "signup" || type === "email") {
          otpType = 'signup';
          setMensaje("Verificando correo electrónico...");
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token as string,
          type: otpType,
        });

        if (error) {
          console.error("❌ Error al verificar OTP:", error);
          throw error;
        }

        console.log("✅ OTP verificado exitosamente");
        
        if (otpType === 'recovery') {
          setTimeout(() => {
            router.replace("/auth/nueva-password");
          }, 500);
        } else {
          Alert.alert(
            "¡Cuenta Verificada!",
            "Tu correo ha sido verificado. Ahora puedes iniciar sesión.",
            [
              {
                text: "Ir al Login",
                onPress: () => router.replace("/auth/login"),
              },
            ]
          );
        }
        return;
      }

      // Si no hay token en absoluto
      throw new Error("No se recibió ningún token de autenticación. Parámetros recibidos: " + Object.keys(params).join(", "));

    } catch (error: any) {
      console.error("❌ Error completo en callback:", error);
      setProcesando(false);
      setMensaje("Error al procesar enlace");
      
      Alert.alert(
        "Error de Autenticación",
        error.message || "No se pudo procesar el enlace de autenticación. El enlace puede haber expirado o ser inválido.",
        [
          {
            text: "Ver Detalles",
            onPress: () => {
              Alert.alert(
                "Información de Depuración",
                `Parámetros recibidos:\n${JSON.stringify(params, null, 2)}\n\nError:\n${error.message}`,
                [{ text: "OK" }]
              );
            },
          },
          {
            text: "Volver al Login",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.containerCentered}>
        <View style={styles.iconContainer}>
          {procesando ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons name="alert-circle-outline" size={80} color={colors.danger} />
          )}
        </View>
        
        <Text style={styles.mensaje}>{mensaje}</Text>
        
        {procesando && (
          <Text style={styles.submensaje}>
            Por favor espera un momento...
          </Text>
        )}

        {/* Información de debug */}
        {debugInfo && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>🔍 Debug Info:</Text>
            <ScrollView style={styles.debugScroll}>
              <Text style={styles.debugText}>{debugInfo}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                Alert.alert("Parámetros Completos", debugInfo);
              }}
            >
              <Text style={styles.debugButtonText}>Copiar Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
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
  debugContainer: {
    marginTop: spacing.xl,
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugTitle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  debugScroll: {
    maxHeight: 200,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: spacing.sm,
  },
  debugText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  debugButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 4,
    alignItems: "center",
  },
  debugButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
});