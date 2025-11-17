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
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/presentation/styles/theme";

export default function RegistroScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const { registrar } = useAuth();
  const router = useRouter();

  const handleRegistro = async () => {
    // VALIDACIONES
    if (!email || !password || !confirmarPassword) {
      Alert.alert("Error", "Completa todos los campos");
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

    // REGISTRO
    setCargando(true);
    const resultado = await registrar(email, password);
    setCargando(false);

    if (resultado.success) {
      Alert.alert(
        "¡Éxito!",
        "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
        [
          { text: "OK", onPress: () => router.replace("/auth/login") },
        ]
      );
    } else {
      Alert.alert("Error", resultado.error || "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Crear Cuenta</Text>
          <Text style={globalStyles.textSecondary}>
            Regístrate como usuario para contratar planes
          </Text>
        </View>

        {/* FORMULARIO */}
        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Confirmar Contraseña"
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
          secureTextEntry
        />

        {/* INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ Los asesores comerciales son creados desde el panel administrativo
          </Text>
        </View>

        {/* BOTÓN REGISTRARSE */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* LINK VOLVER */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkVolver}>
            ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  infoContainer: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  infoText: {
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