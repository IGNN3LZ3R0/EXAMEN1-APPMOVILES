import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { useContrataciones } from "../../src/presentation/hooks/useContrataciones";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/presentation/styles/theme";

export default function ContratacionesScreen() {
  const { usuario, esAsesor } = useAuth();
  const { contrataciones, cargando, cargarContrataciones, actualizarEstado, cancelar } =
    useContrataciones(usuario?.id, esAsesor);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "aprobada" | "rechazada">("todas");
  const router = useRouter();

  const handleRefresh = async () => {
    setRefrescando(true);
    await cargarContrataciones();
    setRefrescando(false);
  };

  const handleAprobar = (contratacionId: string) => {
    Alert.alert(
      "Aprobar Contratación",
      "¿Deseas aprobar esta solicitud de contratación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: async () => {
            const resultado = await actualizarEstado(
              contratacionId,
              "aprobada",
              usuario!.id
            );
            if (resultado.success) {
              Alert.alert("Éxito", "Contratación aprobada");
            } else {
              Alert.alert("Error", resultado.error || "No se pudo aprobar");
            }
          },
        },
      ]
    );
  };

  const handleRechazar = (contratacionId: string) => {
    Alert.alert(
      "Rechazar Contratación",
      "¿Deseas rechazar esta solicitud?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            const resultado = await actualizarEstado(
              contratacionId,
              "rechazada",
              usuario!.id
            );
            if (resultado.success) {
              Alert.alert("Éxito", "Contratación rechazada");
            } else {
              Alert.alert("Error", resultado.error || "No se pudo rechazar");
            }
          },
        },
      ]
    );
  };

  const handleCancelar = (contratacionId: string) => {
    Alert.alert(
      "Cancelar Solicitud",
      "¿Deseas cancelar esta solicitud de contratación?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            const resultado = await cancelar(contratacionId);
            if (resultado.success) {
              Alert.alert("Éxito", "Solicitud cancelada");
            } else {
              Alert.alert("Error", resultado.error || "No se pudo cancelar");
            }
          },
        },
      ]
    );
  };

  const contratacionesFiltradas = contrataciones.filter((c) => {
    if (filtro === "todas") return true;
    return c.estado === filtro;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <View style={[globalStyles.badge, globalStyles.badgeWarning]}>
            <Text style={globalStyles.badgeWarningText}>⏳ Pendiente</Text>
          </View>
        );
      case "aprobada":
        return (
          <View style={[globalStyles.badge, globalStyles.badgeSuccess]}>
            <Text style={globalStyles.badgeSuccessText}>✓ Aprobada</Text>
          </View>
        );
      case "rechazada":
        return (
          <View style={[globalStyles.badge, globalStyles.badgeDanger]}>
            <Text style={globalStyles.badgeDangerText}>✗ Rechazada</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!usuario) {
    return (
      <View style={globalStyles.containerCentered}>
        <Ionicons name="lock-closed-outline" size={80} color={colors.textTertiary} />
        <Text style={globalStyles.emptyState}>Debes iniciar sesión</Text>
        <Text style={[globalStyles.textSecondary, { textAlign: "center", marginTop: spacing.sm }]}>
          Inicia sesión para ver tus contrataciones
        </Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: spacing.md }]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cargando) {
    <View style={globalStyles.container}>
      {/* HEADER */}
      <View style={globalStyles.header}>
        <Text style={styles.titulo}>
          {esAsesor ? "Solicitudes" : "Mis Contrataciones"}
        </Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosContainer}>
        {["todas", "pendiente", "aprobada", "rechazada"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtroBoton,
              filtro === f && styles.filtroActivo,
            ]}
            onPress={() => setFiltro(f as any)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === f && styles.filtroTextoActivo,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA */}
      {cargando ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.lg }}
        />
      ) : (
        <FlatList
          data={contratacionesFiltradas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="clipboard-outline"
                size={80}
                color={colors.textTertiary}
              />
              <Text style={globalStyles.emptyState}>
                {filtro === "todas"
                  ? "No hay contrataciones aún"
                  : `No hay contrataciones ${filtro}s`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={globalStyles.card}>
              {/* HEADER CARD */}
              <View style={styles.cardHeader}>
                <Text style={styles.nombrePlan} numberOfLines={1}>
                  {item.plan?.nombre || "Plan no disponible"}
                </Text>
                {getEstadoBadge(item.estado)}
              </View>

              {/* INFO USUARIO (Para asesores) */}
              {esAsesor && item.usuario && (
                <View style={styles.infoUsuario}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.emailUsuario}>
                    {item.usuario.email}
                  </Text>
                </View>
              )}

              {/* PRECIO */}
              {item.plan && (
                <Text style={styles.precio}>
                  ${item.plan.precio.toFixed(2)}/mes
                </Text>
              )}

              {/* FECHA */}
              <View style={styles.fechaContainer}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.fechaTexto}>
                  Solicitado: {formatearFecha(item.fecha_solicitud)}
                </Text>
              </View>

              {/* NOTAS USUARIO */}
              {item.notas_usuario && (
                <View style={styles.notasContainer}>
                  <Text style={styles.notasLabel}>Notas del usuario:</Text>
                  <Text style={styles.notasTexto}>{item.notas_usuario}</Text>
                </View>
              )}

              {/* NOTAS ASESOR (Para usuarios) */}
              {!esAsesor && item.notas_asesor && (
                <View style={styles.notasContainer}>
                  <Text style={styles.notasLabel}>Notas del asesor:</Text>
                  <Text style={styles.notasTexto}>{item.notas_asesor}</Text>
                </View>
              )}

              {/* BOTONES DE ACCIÓN */}
              {esAsesor && item.estado === "pendiente" ? (
                <View style={styles.botonesAccion}>
                  <TouchableOpacity
                    style={[
                      globalStyles.button,
                      globalStyles.buttonSuccess,
                      styles.botonAccion,
                    ]}
                    onPress={() => handleAprobar(item.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={globalStyles.buttonText}> Aprobar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      globalStyles.button,
                      globalStyles.buttonDanger,
                      styles.botonAccion,
                    ]}
                    onPress={() => handleRechazar(item.id)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                    <Text style={globalStyles.buttonText}> Rechazar</Text>
                  </TouchableOpacity>
                </View>
              ) : !esAsesor && item.estado === "pendiente" ? (
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonDanger]}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Text style={globalStyles.buttonText}>Cancelar Solicitud</Text>
                </TouchableOpacity>
              ) : null}

              {/* VER DETALLES DEL PLAN */}
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonOutline, { marginTop: spacing.sm }]}
                onPress={() => router.push(`/plan/detalle?id=${item.plan_id}`)}
              >
                <Text style={globalStyles.buttonTextOutline}>Ver Detalles del Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
  }

  const styles = StyleSheet.create({
    titulo: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    filtrosContainer: {
      flexDirection: "row",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    filtroBoton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.round,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filtroActivo: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filtroTexto: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    filtroTextoActivo: {
      color: colors.white,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: spacing.xxl,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.sm,
    },
    nombrePlan: {
      flex: 1,
      fontSize: fontSize.lg,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginRight: spacing.sm,
    },
    infoUsuario: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: spacing.xs,
    },
    emailUsuario: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    precio: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    fechaContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: spacing.sm,
    },
    fechaTexto: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    notasContainer: {
      backgroundColor: colors.primaryLight,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginTop: spacing.sm,
    },
    notasLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      fontWeight: "600",
      marginBottom: spacing.xs / 2,
    },
    notasTexto: {
      fontSize: fontSize.sm,
      color: colors.textPrimary,
      fontStyle: "italic",
    },
    botonesAccion: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    botonAccion: {
      flex: 1,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
  });