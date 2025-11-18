import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
      Alert.alert("Error de Inicio de Sesión", resultado.error || "No se pudo iniciar sesión");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>TIGO</Text>
          </View>
          <Text style={styles.titulo}>Planes Móviles</Text>
          <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formulario}>
          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
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

          {/* BOTÓN LOGIN */}
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonLogin,
              cargando && globalStyles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={colors.white} />
                <Text style={globalStyles.buttonText}> Iniciar Sesión</Text>
              </>
            )}
          </TouchableOpacity>

          {/* LINK OLVIDÉ CONTRASEÑA */}
          <TouchableOpacity 
            onPress={() => router.push("/auth/cambiar-password")}
            style={styles.linkContainer}
          >
            <Text style={styles.linkOlvide}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* LINK REGISTRO */}
          <TouchableOpacity 
            style={[globalStyles.button, globalStyles.buttonOutline]}
            onPress={() => router.push("/auth/registro")}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={globalStyles.buttonTextOutline}> Crear Cuenta Nueva</Text>
          </TouchableOpacity>

          {/* INFO INVITADO */}
          <View style={styles.infoInvitado}>
            <Ionicons name="information-circle-outline" size={18} color={colors.info} />
            <Text style={styles.infoTexto}>
              También puedes explorar los planes sin registrarte
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
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
  formulario: {
    width: "100%",
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
  botonLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    marginTop: spacing.sm,
  },
  linkContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  linkOlvide: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  infoInvitado: {
    flexDirection: "row",
    alignItems: "flex-start",
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