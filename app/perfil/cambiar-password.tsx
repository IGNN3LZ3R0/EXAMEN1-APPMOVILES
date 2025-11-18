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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing, borderRadius } from "../../src/presentation/styles/theme";

export default function CambiarPasswordLogueadoScreen() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPasswords, setMostrarPasswords] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  const { actualizarContrasena, verificarContrasenaActual } = useAuth();
  const router = useRouter();

  const handleCambiar = async () => {
    // Validaciones
    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (passwordNueva.length < 6) {
      Alert.alert("Error", "La contraseña nueva debe tener al menos 6 caracteres");
      return;
    }

    if (passwordNueva !== confirmarPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordActual === passwordNueva) {
      Alert.alert("Error", "La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setGuardando(true);

    try {
      // Verificar contraseña actual (sin crear nueva sesión)
      const verificacion = await verificarContrasenaActual(passwordActual);
      
      if (!verificacion.success) {
        Alert.alert("Error", "La contraseña actual es incorrecta");
        setGuardando(false);
        return;
      }

      // Actualizar la contraseña
      const resultado = await actualizarContrasena(passwordNueva);
      
      setGuardando(false);

      if (resultado.success) {
        Alert.alert(
          "¡Contraseña Actualizada!",
          "Tu contraseña ha sido cambiada exitosamente.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Error", resultado.error || "No se pudo cambiar la contraseña");
      }
    } catch (error: any) {
      setGuardando(false);
      Alert.alert("Error", error.message || "Ocurrió un error al cambiar la contraseña");
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Cambiar Contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ICONO */}
        <View style={styles.iconoContainer}>
          <View style={styles.iconoCirculo}>
            <Ionicons name="lock-closed" size={50} color={colors.white} />
          </View>
        </View>

        <Text style={styles.descripcion}>
          Ingresa tu contraseña actual y luego tu nueva contraseña
        </Text>

        {/* FORMULARIO */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña Actual</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña actual"
              value={passwordActual}
              onChangeText={setPasswordActual}
              secureTextEntry={!mostrarPasswords}
              autoComplete="password"
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={passwordNueva}
              onChangeText={setPasswordNueva}
              secureTextEntry={!mostrarPasswords}
              autoComplete="password"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repite tu nueva contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarPasswords}
              autoComplete="password"
            />
          </View>
        </View>

        {/* TOGGLE MOSTRAR CONTRASEÑAS */}
        <TouchableOpacity
          style={styles.toggleMostrar}
          onPress={() => setMostrarPasswords(!mostrarPasswords)}
        >
          <Ionicons 
            name={mostrarPasswords ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.toggleTexto}>
            {mostrarPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
          </Text>
        </TouchableOpacity>

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
            Por seguridad, necesitamos verificar tu contraseña actual antes de cambiarla
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontSize: fontSize.md,
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
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  toggleMostrar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleTexto: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
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