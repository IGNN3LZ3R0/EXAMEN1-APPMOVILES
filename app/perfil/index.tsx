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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import { colors, fontSize, spacing, borderRadius } from "../../src/presentation/styles/theme";

export default function PerfilScreen() {
  const { usuario, actualizarPerfil, esAsesor } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const validarTelefono = (tel: string) => {
    if (!tel.trim()) return true;
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
      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
      setModoEdicion(false);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo actualizar el perfil");
    }
  };

  if (!usuario) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const iniciales = (usuario.nombre || usuario.email)
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER CON GRADIENTE */}
        <LinearGradient
          colors={esAsesor ? [colors.primary, '#00509E'] : [colors.secondary, '#00C8F0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity 
              onPress={() => setModoEdicion(!modoEdicion)}
              style={styles.editButton}
            >
              <Ionicons 
                name={modoEdicion ? "close-circle" : "create"} 
                size={24} 
                color={colors.white} 
              />
            </TouchableOpacity>
          </View>

          {/* AVATAR Y ROL */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#FFD100', '#FFE44D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{iniciales}</Text>
              </LinearGradient>
            </View>

            <View style={styles.rolBadge}>
              <Ionicons 
                name={esAsesor ? "shield-checkmark" : "person"} 
                size={16} 
                color={colors.white} 
              />
              <Text style={styles.rolTexto}>
                {esAsesor ? "Asesor Comercial" : "Usuario Registrado"}
              </Text>
            </View>

            <Text style={styles.nombreHeader}>
              {usuario.nombre || "Usuario"}
            </Text>
          </View>
        </LinearGradient>

        {/* CONTENIDO */}
        <View style={styles.content}>
          {/* ESPACIADOR */}
          <View style={styles.espaciador} />
          {/* INFORMACIÓN DE CUENTA */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.seccionTitulo}>Información de Cuenta</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail" size={20} color={colors.secondary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Email</Text>
                  <Text style={styles.cardValue}>{usuario.email}</Text>
                </View>
                <View style={styles.verificadoBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                </View>
              </View>
            </View>
          </View>

          {/* INFORMACIÓN PERSONAL */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Ionicons name="person-circle" size={20} color={colors.primary} />
              <Text style={styles.seccionTitulo}>Información Personal</Text>
            </View>

            {/* NOMBRE */}
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre Completo</Text>
                {modoEdicion ? (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu nombre"
                      value={nombre}
                      onChangeText={setNombre}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                ) : (
                  <Text style={styles.inputValue}>{nombre || "No especificado"}</Text>
                )}
              </View>

              {/* TELÉFONO */}
              <View style={styles.divider} />
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                {modoEdicion ? (
                  <>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="+593 999123456"
                        value={telefono}
                        onChangeText={setTelefono}
                        keyboardType="phone-pad"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                    <Text style={styles.helperText}>Formato: +593 seguido de 9 dígitos</Text>
                  </>
                ) : (
                  <Text style={styles.inputValue}>{telefono || "No especificado"}</Text>
                )}
              </View>
            </View>

            {/* BOTÓN GUARDAR */}
            {modoEdicion && (
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={handleGuardarPerfil}
                disabled={guardando}
              >
                <LinearGradient
                  colors={[colors.success, '#66BB6A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.botonGradient}
                >
                  {guardando ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                      <Text style={styles.botonTexto}>Guardar Cambios</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* SEGURIDAD */}
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.seccionTitulo}>Seguridad</Text>
            </View>
            <TouchableOpacity
              style={styles.opcionCard}
              onPress={() => router.push("/perfil/cambiar-password" as any)}
            >
              <View style={styles.opcionIconContainer}>
                <Ionicons name="key" size={24} color={colors.primary} />
              </View>
              <View style={styles.opcionContent}>
                <Text style={styles.opcionTitulo}>Cambiar Contraseña</Text>
                <Text style={styles.opcionDescripcion}>
                  Actualiza tu contraseña de acceso
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* INFO ADICIONAL */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.info} />
            <Text style={styles.infoTexto}>
              Tu información está protegida y encriptada
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: "900",
    color: colors.primary,
  },
  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginBottom: spacing.sm,
  },
  rolTexto: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.white,
  },
  nombreHeader: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  espaciador: {
    height: spacing.md,
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  seccionTitulo: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  verificadoBadge: {
    width: 24,
    height: 24,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  inputValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  botonGuardar: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  botonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  botonTexto: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.white,
  },
  opcionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  opcionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  opcionContent: {
    flex: 1,
  },
  opcionTitulo: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  opcionDescripcion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTexto: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});