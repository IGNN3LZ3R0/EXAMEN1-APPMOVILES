import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function PerfilScreen() {
  const { usuario, actualizarPerfil, restablecerContrasena, esAsesor } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [guardando, setGuardando] = useState(false);

  const validarTelefono = (tel: string) => {
    if (!tel.trim()) return true; // Opcional
    const regex = /^(\+593|0)?[9][0-9]{8}$/;
    return regex.test(tel.replace(/\s/g, ""));
  };

  const handleGuardarPerfil = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    if (telefono.trim() && !validarTelefono(telefono)) {
      Alert.alert(
        "Error",
        "Número de teléfono inválido. Formato: +593 99 123 4567 o 0991234567"
      );
      return;
    }

    setGuardando(true);
    const resultado = await actualizarPerfil(nombre, telefono);
    setGuardando(false);

    if (resultado.success) {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } else {
      Alert.alert("Error", resultado.error || "No se pudo actualizar el perfil");
    }
  };

  const handleRestablecerContrasena = async () => {
    if (!usuario?.email) return;

    Alert.alert(
      "Restablecer Contraseña",
      `Se enviará un email a ${usuario.email} con las instrucciones para restablecer tu contraseña. ¿Deseas continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            const resultado = await restablecerContrasena(usuario.email);
            if (resultado.success) {
              Alert.alert(
                "Email Enviado",
                "Revisa tu correo electrónico para restablecer tu contraseña"
              );
            } else {
              Alert.alert("Error", resultado.error || "No se pudo enviar el email");
            }
          },
        },
      ]
    );
  };

  if (!usuario) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={globalStyles.contentPadding}>
        {/* AVATAR */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, esAsesor && styles.avatarAsesor]}>
            <Ionicons
              name={esAsesor ? "briefcase" : "person"}
              size={50}
              color={colors.white}
            />
          </View>
          <View style={[globalStyles.badge, esAsesor ? styles.badgeAsesor : styles.badgeUsuario]}>
            <Text style={styles.badgeText}>
              {esAsesor ? "Asesor Comercial" : "Usuario Registrado"}
            </Text>
          </View>
          <Text style={styles.nombrePerfil}>
            {usuario.nombre || "Usuario"}
          </Text>
        </View>

        {/* INFORMACIÓN DE SOLO LECTURA */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📧 Información de Cuenta</Text>
          <View style={styles.infoCard}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <View style={styles.infoTexto}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValor}>{usuario.email}</Text>
            </View>
          </View>
        </View>

        {/* EDITAR NOMBRE */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>👤 Información Personal</Text>
          
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre completo"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+593 99 123 4567"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary]}
            onPress={handleGuardarPerfil}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="save" size={20} color={colors.white} />
                <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>
                  Guardar Cambios
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* SEGURIDAD */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🔒 Seguridad</Text>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonOutline]}
            onPress={handleRestablecerContrasena}
          >
            <Ionicons name="key-outline" size={20} color={colors.primary} />
            <Text style={[globalStyles.buttonTextOutline, { marginLeft: 8 }]}>
              Restablecer Contraseña
            </Text>
          </TouchableOpacity>
        </View>

        {/* INFO ADICIONAL */}
        <View style={styles.infoAdicional}>
          <Ionicons name="information-circle" size={16} color={colors.info} />
          <Text style={styles.infoAdicionalTexto}>
            Al restablecer la contraseña, recibirás un email con las instrucciones
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
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarAsesor: {
    backgroundColor: colors.primary,
  },
  badgeAsesor: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  badgeUsuario: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: "600",
  },
  nombrePerfil: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  seccionTitulo: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  infoTexto: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  infoValor: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "600",
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
  infoAdicional: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: "flex-start",
  },
  infoAdicionalTexto: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});