import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/presentation/styles/theme";

export default function CambiarPasswordScreen() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { restablecerContrasena } = useAuth();
  const router = useRouter();

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu email");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    setEnviando(true);
    const resultado = await restablecerContrasena(email);
    setEnviando(false);

    if (resultado.success) {
      Alert.alert(
        "Email Enviado",
        "Hemos enviado un enlace a tu correo electrónico para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Error", resultado.error || "No se pudo enviar el email");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ICONO */}
        <View style={styles.iconoContainer}>
          <View style={styles.iconoCirculo}>
            <Ionicons name="key" size={50} color={colors.white} />
          </View>
        </View>

        {/* TÍTULO */}
        <Text style={globalStyles.title}>Restablecer Contraseña</Text>
        <Text style={[globalStyles.textSecondary, styles.descripcion]}>
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </Text>

        {/* FORMULARIO */}
        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* BOTÓN ENVIAR */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={handleEnviar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="mail-outline" size={20} color={colors.white} />
              <Text style={globalStyles.buttonText}> Enviar Enlace</Text>
            </>
          )}
        </TouchableOpacity>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTexto}>
            ℹ️ Si no recibes el email en unos minutos, revisa tu carpeta de spam
          </Text>
        </View>

        {/* LINK VOLVER */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkVolver}>
            ¿Recordaste tu contraseña? <Text style={styles.linkBold}>Volver al login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  iconoContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  iconoCirculo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  descripcion: {
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  infoContainer: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  infoTexto: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  linkVolver: {
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: "bold",
  },
});