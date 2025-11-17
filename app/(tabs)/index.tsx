import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/presentation/styles/theme";

export default function HomeScreen() {
  const { usuario, cerrarSesion, esAsesor } = useAuth();
  const { planes, cargando, cargarPlanes, eliminar } = usePlanes(
    esAsesor ? usuario?.id : undefined
  );
  const [refrescando, setRefrescando] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefrescando(true);
    await cargarPlanes();
    setRefrescando(false);
  };

  const handleCerrarSesion = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await cerrarSesion();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  const handleEliminar = (planId: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este plan?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const resultado = await eliminar(planId);
            if (resultado.success) {
              Alert.alert("Éxito", "Plan eliminado correctamente");
            } else {
              Alert.alert("Error", resultado.error || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* HEADER */}
      <View style={globalStyles.header}>
        <View>
          <Text style={styles.saludo}>
            {!usuario
              ? "Catálogo de Planes"
              : esAsesor
                ? "Panel de Asesor"
                : "Planes Disponibles"}
          </Text>
          {usuario ? (
            <Text style={globalStyles.textSecondary}>{usuario.email}</Text>
          ) : (
            <Text style={globalStyles.textSecondary}>Usuario Invitado</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {usuario ? (
            <>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={() => router.push("/perfil")}
              >
                <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonIcono}
                onPress={handleCerrarSesion}
              >
                <Ionicons name="log-out-outline" size={28} color={colors.danger} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonLogin]}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BOTÓN CREAR PLAN (Solo Asesores) */}
      {esAsesor && (
        <View style={styles.botonCrearContainer}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.botonCrear]}
            onPress={() => router.push("/plan/crear")}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={globalStyles.buttonText}> Crear Nuevo Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA DE PLANES */}
      {cargando ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.lg }}
        />
      ) : (
        <FlatList
          data={planes}
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
              <Ionicons name="phone-portrait-outline" size={80} color={colors.textTertiary} />
              <Text style={globalStyles.emptyState}>
                {esAsesor ? "No has creado planes aún" : "No hay planes disponibles"}
              </Text>
              {esAsesor && (
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: spacing.md }]}
                  onPress={() => router.push("/plan/crear")}
                >
                  <Text style={globalStyles.buttonText}>Crear Primer Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.card}
              onPress={() => router.push(`/plan/detalle?id=${item.id}`)}
              activeOpacity={0.7}
            >
              {/* IMAGEN */}
              {item.imagen_url ? (
                <Image
                  source={{ uri: item.imagen_url }}
                  style={globalStyles.cardImage}
                />
              ) : (
                <View style={styles.imagenPlaceholder}>
                  <Ionicons name="phone-portrait-outline" size={60} color={colors.textTertiary} />
                  <Text style={globalStyles.textTertiary}>Sin imagen</Text>
                </View>
              )}

              {/* INFORMACIÓN */}
              <View style={styles.infoContainer}>
                <View style={styles.headerPlan}>
                  <Text style={styles.nombrePlan} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <View style={styles.precioBadge}>
                    <Text style={styles.precioTexto}>${item.precio.toFixed(2)}</Text>
                  </View>
                </View>

                {/* DETALLES */}
                <View style={styles.detallesPlan}>
                  {item.datos_gb && (
                    <View style={styles.detalleItem}>
                      <Ionicons name="wifi" size={14} color={colors.primary} />
                      <Text style={styles.textoDetalle}>{item.datos_gb}</Text>
                    </View>
                  )}
                  {item.minutos_voz && (
                    <View style={styles.detalleItem}>
                      <Ionicons name="call" size={14} color={colors.primary} />
                      <Text style={styles.textoDetalle}>{item.minutos_voz}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* BOTONES DE ACCIÓN (Solo para asesores) */}
              {esAsesor && usuario?.id === item.asesor_id && (
                <View style={styles.botonesAccion}>
                  <TouchableOpacity
                    style={[globalStyles.button, globalStyles.buttonSecondary, styles.botonAccion]}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/plan/editar?id=${item.id}`);
                    }}
                  >
                    <Ionicons name="pencil" size={16} color="white" />
                    <Text style={globalStyles.buttonText}> Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.button, globalStyles.buttonDanger, styles.botonAccion]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEliminar(item.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="white" />
                    <Text style={globalStyles.buttonText}> Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  saludo: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botonIcono: {
    padding: spacing.xs,
  },
  botonCrearContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  botonCrear: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  imagenPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  infoContainer: {
    paddingTop: spacing.md,
  },
  headerPlan: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  nombrePlan: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  precioBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  precioTexto: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    color: colors.white,
  },
  detallesPlan: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  detalleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  textoDetalle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
});