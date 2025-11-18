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
import { colors, fontSize, spacing, borderRadius } from "../../src/presentation/styles/theme";

export default function NuevaPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const { actualizarContrasena } = useAuth();
  const router = useRouter();

  const handleCambiar = async () => {
    // Validaciones
    if (!password || !confirmarPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);
    const resultado = await actualizarContrasena(password);
    setGuardando(false);

    if (resultado.success) {
      Alert.alert(
        "¡Contraseña Actualizada!",
        "Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    } else {
      Alert.alert("Error", resultado.error || "No se pudo cambiar la contraseña");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* ICONO */}
        <View style={styles.iconoContainer}>
          <View style={styles.iconoCirculo}>
            <Ionicons name="lock-closed" size={50} color={colors.white} />
          </View>
        </View>

        {/* TÍTULO */}
        <Text style={globalStyles.title}>Nueva Contraseña</Text>
        <Text style={[globalStyles.textSecondary, styles.descripcion]}>
          Ingresa tu nueva contraseña para tu cuenta
        </Text>

        {/* FORMULARIO */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
              autoComplete="password"
            />
            <TouchableOpacity 
              onPress={() => setMostrarPassword(!mostrarPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={mostrarPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarPassword}
              autoComplete="password"
            />
          </View>
        </View>

        {/* BOTÓN CAMBIAR */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonCambiar]}
          onPress={handleCambiar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              <Text style={globalStyles.buttonText}> Cambiar Contraseña</Text>
            </>
          )}
        </TouchableOpacity>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.infoTexto}>
            Tu contraseña debe tener al menos 6 caracteres
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  botonCambiar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    marginTop: spacing.sm,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  infoTexto: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});