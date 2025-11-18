import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  const { registrar } = useAuth();
  const router = useRouter();

  const validarTelefono = (tel: string) => {
    // Formato Ecuador: +593 99 123 4567 o 0991234567
    const regex = /^(\+593|0)?[9][0-9]{8}$/;
    return regex.test(tel.replace(/\s/g, ""));
  };

  const handleRegistro = async () => {
    // VALIDACIONES
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre completo");
      return;
    }

    if (!telefono.trim()) {
      Alert.alert("Error", "Por favor ingresa tu número de teléfono");
      return;
    }

    if (!validarTelefono(telefono)) {
      Alert.alert(
        "Error",
        "Número de teléfono inválido. Formato: +593 99 123 4567 o 0991234567"
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "El email no es válido");
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
    const resultado = await registrar(email, password, nombre, telefono);
    setCargando(false);

    if (resultado.success) {
      Alert.alert(
        "¡Registro Exitoso!",
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
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER CON VOLVER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ICONO Y TÍTULO */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={50} color={colors.white} />
          </View>
        </View>

        <Text style={styles.titulo}>Crear Cuenta</Text>
        <Text style={styles.subtitulo}>
          Completa tus datos para registrarte
        </Text>

        {/* FORMULARIO */}
        <View style={styles.formContainer}>
          {/* NOMBRE */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* TELÉFONO */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono (Ej: +593 99 123 4567)"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
            />
            <TouchableOpacity
              onPress={() => setMostrarPassword(!mostrarPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={mostrarPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRMAR CONTRASEÑA */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarPassword}
            />
          </View>

          {/* INFO */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color={colors.info} />
            <Text style={styles.infoText}>
              Los asesores comerciales son creados desde el panel administrativo
            </Text>
          </View>

          {/* BOTÓN REGISTRARSE */}
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonRegistro]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Registrarse</Text>
              </>
            )}
          </TouchableOpacity>

          {/* LINK VOLVER */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkVolver}>
              ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  formContainer: {
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  botonRegistro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
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