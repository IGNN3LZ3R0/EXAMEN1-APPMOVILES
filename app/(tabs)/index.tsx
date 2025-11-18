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
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/presentation/styles/theme";

const { width } = Dimensions.get('window');

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
      {/* HEADER CON GRADIENTE */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>TIGO</Text>
            </View>
            <View>
              <Text style={styles.saludo}>
                {!usuario
                  ? "Explora Planes"
                  : esAsesor
                    ? "Panel Asesor"
                    : "Hola!"}
              </Text>
              {usuario ? (
                <Text style={styles.emailHeader}>{usuario.nombre || usuario.email.split('@')[0]}</Text>
              ) : (
                <Text style={styles.emailHeader}>Usuario Invitado</Text>
              )}
            </View>
          </View>
          <View style={styles.headerButtons}>
            {usuario ? (
              <>
                <TouchableOpacity
                  style={styles.botonIconoHeader}
                  onPress={() => router.push("/perfil")}
                >
                  <Ionicons name="person-circle" size={28} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonIconoHeader}
                  onPress={handleCerrarSesion}
                >
                  <Ionicons name="log-out" size={24} color={colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.botonLoginHeader}
                onPress={() => router.push("/auth/login")}
              >
                <Ionicons name="log-in" size={18} color={colors.primary} />
                <Text style={styles.botonLoginTexto}>Entrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* BOTÓN CREAR PLAN (Solo Asesores) */}
      {esAsesor && (
        <View style={styles.botonCrearContainer}>
          <TouchableOpacity
            style={styles.botonCrear}
            onPress={() => router.push("/plan/crear")}
          >
            <LinearGradient
              colors={[colors.accent, '#FFE44D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.botonCrearGradient}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.botonCrearTexto}>Crear Nuevo Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA DE PLANES */}
      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      ) : (
        <FlatList
          data={planes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaContent}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="phone-portrait-outline" size={80} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {esAsesor ? "No has creado planes" : "No hay planes disponibles"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {esAsesor 
                  ? "Crea tu primer plan móvil para comenzar" 
                  : "Regresa pronto para ver nuevos planes"}
              </Text>
              {esAsesor && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/plan/crear")}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.emptyButtonText}>Crear Primer Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => router.push(`/plan/detalle?id=${item.id}`)}
              activeOpacity={0.9}
            >
              {/* IMAGEN CON BADGE DE PRECIO */}
              <View style={styles.imagenContainer}>
                {item.imagen_url ? (
                  <Image
                    source={{ uri: item.imagen_url }}
                    style={styles.planImagen}
                  />
                ) : (
                  <View style={styles.imagenPlaceholder}>
                    <Ionicons name="phone-portrait" size={60} color={colors.primary} />
                  </View>
                )}
                {/* BADGE DE PRECIO FLOTANTE */}
                <View style={styles.precioBadge}>
                  <LinearGradient
                    colors={[colors.accent, '#FFE44D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.precioBadgeGradient}
                  >
                    <Text style={styles.precioSigno}>$</Text>
                    <Text style={styles.precioNumero}>{item.precio.toFixed(2)}</Text>
                    <Text style={styles.precioMes}>/mes</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* INFORMACIÓN DEL PLAN */}
              <View style={styles.planInfo}>
                <Text style={styles.planNombre} numberOfLines={2}>
                  {item.nombre}
                </Text>

                {/* CARACTERÍSTICAS EN CHIPS */}
                <View style={styles.caracteristicas}>
                  {item.datos_gb && (
                    <View style={styles.chip}>
                      <Ionicons name="wifi" size={14} color={colors.primary} />
                      <Text style={styles.chipText}>{item.datos_gb}</Text>
                    </View>
                  )}
                  {item.minutos_voz && (
                    <View style={styles.chip}>
                      <Ionicons name="call" size={14} color={colors.secondary} />
                      <Text style={styles.chipText}>{item.minutos_voz}</Text>
                    </View>
                  )}
                </View>

                {/* SEGMENTO */}
                {item.segmento && (
                  <View style={styles.segmentoBadge}>
                    <Text style={styles.segmentoTexto}>{item.segmento}</Text>
                  </View>
                )}
              </View>

              {/* BOTONES DE ACCIÓN (Solo para asesores) */}
              {esAsesor && usuario?.id === item.asesor_id && (
                <View style={styles.botonesAccion}>
                  <TouchableOpacity
                    style={[styles.botonAccion, styles.botonEditar]}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/plan/editar?id=${item.id}`);
                    }}
                  >
                    <Ionicons name="create" size={16} color={colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botonAccion, styles.botonEliminar]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEliminar(item.id);
                    }}
                  >
                    <Ionicons name="trash" size={16} color={colors.white} />
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
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: "900",
    color: colors.primary,
  },
  saludo: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.white,
  },
  emailHeader: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  botonIconoHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
  },
  botonLoginHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  botonLoginTexto: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  botonCrearContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  botonCrear: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  botonCrearGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  botonCrearTexto: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  listaContent: {
    padding: spacing.md,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imagenContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  planImagen: {
    width: "100%",
    height: "100%",
  },
  imagenPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  precioBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  precioBadgeGradient: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  precioSigno: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
  },
  precioNumero: {
    fontSize: fontSize.xl,
    fontWeight: "900",
    color: colors.primary,
  },
  precioMes: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 2,
  },
  planInfo: {
    padding: spacing.md,
  },
  planNombre: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  caracteristicas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  segmentoBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  segmentoTexto: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.primary,
  },
  botonesAccion: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
  },
  botonAccion: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  botonEditar: {
    backgroundColor: colors.secondary,
  },
  botonEliminar: {
    backgroundColor: colors.danger,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});