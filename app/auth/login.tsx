import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/presentation/styles/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setCargando(true);
    const resultado = await iniciarSesion(email, password);
    setCargando(false);

    if (resultado.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", resultado.error || "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>TIGO</Text>
          </View>
          <Text style={styles.titulo}>Planes Móviles</Text>
          <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
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
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* BOTÓN LOGIN */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonLogin,
          ]}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        {/* LINK OLVIDÉ CONTRASEÑA */}
        <TouchableOpacity onPress={() => router.push("/auth/cambiar-password")}>
          <Text style={styles.linkOlvide}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* DIVIDER */}
        <View style={globalStyles.divider} />

        {/* LINK REGISTRO */}
        <TouchableOpacity onPress={() => router.push("/auth/registro")}>
          <Text style={styles.linkRegistro}>
            ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginVertical: spacing.xxl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.white,
  },
  titulo: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  botonLogin: {
    marginTop: spacing.sm,
  },
  linkOlvide: {
    textAlign: "center",
    marginTop: spacing.md,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  linkRegistro: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: "bold",
  },
});