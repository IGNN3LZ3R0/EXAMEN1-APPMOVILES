import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { useContrataciones } from "../../src/presentation/hooks/useContrataciones";
import { PlanMovil } from "../../src/domain/models/PlanMovil";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/presentation/styles/theme";

export default function DetallePlanScreen() {
  const { id } = useLocalSearchParams();
  const { usuario, esAsesor } = useAuth();
  const { planes } = usePlanes();
  const { crear } = useContrataciones(usuario?.id);
  const router = useRouter();

  const [plan, setPlan] = useState<PlanMovil | null>(null);
  const [contratando, setContratando] = useState(false);

  useEffect(() => {
    const planEncontrado = planes.find((p) => p.id === id);
    setPlan(planEncontrado || null);
  }, [id, planes]);

  const handleContratar = async () => {
    if (!usuario) {
      Alert.alert("Error", "Debes iniciar sesión para contratar un plan");
      router.push("/auth/login");
      return;
    }

    Alert.alert(
      "Confirmar Contratación",
      `¿Deseas solicitar la contratación del plan ${plan?.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setContratando(true);
            const resultado = await crear(usuario.id, plan!.id);
            setContratando(false);

            if (resultado.success) {
              Alert.alert(
                "¡Solicitud Enviada!",
                "Tu solicitud de contratación ha sido enviada. Un asesor la revisará pronto.",
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/(tabs)/contrataciones"),
                  },
                ]
              );
            } else {
              Alert.alert("Error", resultado.error || "No se pudo crear la solicitud");
            }
          },
        },
      ]
    );
  };

  if (!plan) {
    return (
      <View style={globalStyles.containerCentered}>
        <Ionicons name="alert-circle-outline" size={80} color={colors.textTertiary} />
        <Text style={globalStyles.emptyState}>Plan no encontrado</Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: spacing.md }]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const puedeEditar = esAsesor && usuario?.id === plan.asesor_id;

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          {puedeEditar && (
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonSecondary, styles.botonEditar]}
              onPress={() => router.push(`/plan/editar?id=${plan.id}`)}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.white} />
              <Text style={globalStyles.buttonText}> Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* IMAGEN */}
        {plan.imagen_url ? (
          <Image source={{ uri: plan.imagen_url }} style={styles.imagenPortada} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="phone-portrait-outline" size={80} color={colors.textTertiary} />
            <Text style={globalStyles.textTertiary}>Sin imagen</Text>
          </View>
        )}

        {/* NOMBRE Y PRECIO */}
        <View style={styles.headerInfo}>
          <Text style={styles.nombre}>{plan.nombre}</Text>
          <View style={styles.precioBadge}>
            <Text style={styles.precioTexto}>${plan.precio.toFixed(2)}</Text>
            <Text style={styles.precioMes}>/mes</Text>
          </View>
        </View>

        {/* SEGMENTO Y PÚBLICO */}
        {(plan.segmento || plan.publico_objetivo) && (
          <View style={styles.infoRapida}>
            {plan.segmento && (
              <View style={[globalStyles.badge, styles.badgeSegmento]}>
                <Text style={globalStyles.badgeText}>{plan.segmento}</Text>
              </View>
            )}
          </View>
        )}

        {plan.publico_objetivo && (
          <Text style={styles.publicoObjetivo}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            {" "}{plan.publico_objetivo}
          </Text>
        )}

        {/* CARACTERÍSTICAS PRINCIPALES */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>📦 Características Principales</Text>

          <View style={styles.caracteristicaCard}>
            <Ionicons name="wifi" size={24} color={colors.primary} />
            <View style={styles.caracteristicaInfo}>
              <Text style={styles.caracteristicaTitulo}>Datos Móviles</Text>
              <Text style={styles.caracteristicaValor}>
                {plan.datos_gb || "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.caracteristicaCard}>
            <Ionicons name="call" size={24} color={colors.primary} />
            <View style={styles.caracteristicaInfo}>
              <Text style={styles.caracteristicaTitulo}>Minutos de Voz</Text>
              <Text style={styles.caracteristicaValor}>
                {plan.minutos_voz || "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.caracteristicaCard}>
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            <View style={styles.caracteristicaInfo}>
              <Text style={styles.caracteristicaTitulo}>SMS</Text>
              <Text style={styles.caracteristicaValor}>
                {plan.sms || "No especificado"}
              </Text>
            </View>
          </View>
        </View>

        {/* VELOCIDADES */}
        {(plan.velocidad_4g || plan.velocidad_5g) && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>⚡ Velocidad de Conexión</Text>

            {plan.velocidad_4g && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>4G LTE:</Text>
                <Text style={styles.detalleValor}>{plan.velocidad_4g}</Text>
              </View>
            )}

            {plan.velocidad_5g && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>5G:</Text>
                <Text style={styles.detalleValor}>{plan.velocidad_5g}</Text>
              </View>
            )}
          </View>
        )}

        {/* APLICACIONES Y SERVICIOS */}
        {(plan.redes_sociales || plan.whatsapp) && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>📱 Aplicaciones y Servicios</Text>

            {plan.redes_sociales && (
              <View style={styles.servicioCard}>
                <Ionicons name="logo-instagram" size={20} color={colors.accent} />
                <Text style={styles.servicioTexto}>{plan.redes_sociales}</Text>
              </View>
            )}

            {plan.whatsapp && (
              <View style={styles.servicioCard}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.servicioTexto}>{plan.whatsapp}</Text>
              </View>
            )}
          </View>
        )}

        {/* LLAMADAS Y ROAMING */}
        {(plan.llamadas_internacionales || plan.roaming) && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>🌎 Internacional</Text>

            {plan.llamadas_internacionales && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Llamadas Internacionales:</Text>
                <Text style={styles.detalleValor}>{plan.llamadas_internacionales}</Text>
              </View>
            )}

            {plan.roaming && (
              <View style={styles.detalleItem}>
                <Text style={styles.detalleLabel}>Roaming:</Text>
                <Text style={styles.detalleValor}>{plan.roaming}</Text>
              </View>
            )}
          </View>
        )}

        {/* BOTÓN CONTRATAR (Solo para usuarios registrados) */}
        {!esAsesor && usuario && (
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonContratar,
            ]}
            onPress={handleContratar}
            disabled={contratando}
          >
            {contratando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={globalStyles.buttonText}> Solicitar Contratación</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* INFO PARA INVITADOS */}
        {!usuario && (
          <View style={styles.infoInvitado}>
            <Text style={styles.infoInvitadoTexto}>
              ℹ️ Inicia sesión para solicitar la contratación de este plan
            </Text>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonOutline, { marginTop: spacing.sm }]}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={globalStyles.buttonTextOutline}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  botonEditar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  imagenPortada: {
    width: "100%",
    height: 250,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.borderLight,
  },
  imagenPlaceholder: {
    width: "100%",
    height: 250,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    marginBottom: spacing.md,
  },
  nombre: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  precioBadge: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  precioTexto: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.primary,
  },
  precioMes: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  infoRapida: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badgeSegmento: {
    backgroundColor: colors.accent,
  },
  publicoObjetivo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  tituloSeccion: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  caracteristicaCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  caracteristicaInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  caracteristicaTitulo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  caracteristicaValor: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  detalleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detalleLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detalleValor: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  servicioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  servicioTexto: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  botonContratar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  infoInvitado: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  infoInvitadoTexto: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});