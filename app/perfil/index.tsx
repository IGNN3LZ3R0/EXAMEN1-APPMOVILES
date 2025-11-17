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

export default function PerfilScreen() {
  const { usuario, actualizarPerfil, restablecerContrasena, esAsesor } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [guardando, setGuardando] = useState(false);

  const handleGuardarPerfil = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    setGuardando(true);
    const resultado = await actualizarPerfil(nombre);
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
    <View style={globalStyles.container}>
      {/* HEADER */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={globalStyles.contentPadding}>
        {/* AVATAR */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons
              name={esAsesor ? "briefcase" : "person"}
              size={50}
              color={colors.white}
            />
          </View>
          <View style={[globalStyles.badge, esAsesor ? styles.badgeAsesor : styles.badgeUsuario]}>
            <Text style={styles.badgeText}>
              {esAsesor ? "Asesor Comercial" : "Usuario"}
            </Text>
          </View>
        </View>

        {/* INFORMACIÓN */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.valorEmail}>{usuario.email}</Text>
        </View>

        {/* EDITAR NOMBRE */}
        <View style={styles.seccion}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary]}
            onPress={handleGuardarPerfil}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RESTABLECER CONTRASEÑA */}
        <View style={styles.seccion}>
          <Text style={styles.label}>Seguridad</Text>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonOutline]}
            onPress={handleRestablecerContrasena}
          >
            <Ionicons name="key-outline" size={20} color={colors.primary} />
            <Text style={globalStyles.buttonTextOutline}> Restablecer Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* INFO ADICIONAL */}
        <View style={styles.infoAdicional}>
          <Text style={styles.infoTexto}>
            ℹ️ Al restablecer la contraseña, recibirás un email con las instrucciones
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  badgeAsesor: {
    backgroundColor: colors.primary,
  },
  badgeUsuario: {
    backgroundColor: colors.secondary,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  valorEmail: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  infoAdicional: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  infoTexto: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});