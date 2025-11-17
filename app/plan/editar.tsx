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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { usePlanes } from "../../src/presentation/hooks/usePlanes";
import { PlanMovil } from "../../src/domain/models/PlanMovil";
import { globalStyles } from "../../src/presentation/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/presentation/styles/theme";

export default function EditarPlanScreen() {
  const { id } = useLocalSearchParams();
  const { usuario, esAsesor } = useAuth();
  const { planes, actualizar, subirImagen, seleccionarImagen, tomarFoto } = usePlanes();
  const router = useRouter();

  const [plan, setPlan] = useState<PlanMovil | null>(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [datosGb, setDatosGb] = useState("");
  const [minutosVoz, setMinutosVoz] = useState("");
  const [sms, setSms] = useState("");
  const [velocidad4g, setVelocidad4g] = useState("");
  const [velocidad5g, setVelocidad5g] = useState("");
  const [redesSociales, setRedesSociales] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [llamadasInternacionales, setLlamadasInternacionales] = useState("");
  const [roaming, setRoaming] = useState("");
  const [segmento, setSegmento] = useState("");
  const [publicoObjetivo, setPublicoObjetivo] = useState("");
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const planEncontrado = planes.find((p) => p.id === id);
    if (planEncontrado) {
      setPlan(planEncontrado);
      setNombre(planEncontrado.nombre);
      setPrecio(planEncontrado.precio.toString());
      setDatosGb(planEncontrado.datos_gb || "");
      setMinutosVoz(planEncontrado.minutos_voz || "");
      setSms(planEncontrado.sms || "");
      setVelocidad4g(planEncontrado.velocidad_4g || "");
      setVelocidad5g(planEncontrado.velocidad_5g || "");
      setRedesSociales(planEncontrado.redes_sociales || "");
      setWhatsapp(planEncontrado.whatsapp || "");
      setLlamadasInternacionales(planEncontrado.llamadas_internacionales || "");
      setRoaming(planEncontrado.roaming || "");
      setSegmento(planEncontrado.segmento || "");
      setPublicoObjetivo(planEncontrado.publico_objetivo || "");
      setImagenUri(planEncontrado.imagen_url || null);
    }
  }, [id, planes]);

  const handleSeleccionarImagen = async () => {
    Alert.alert(
      "Imagen del Plan",
      "¿Desde dónde quieres agregar la imagen?",
      [
        {
          text: "Galería",
          onPress: async () => {
            const uri = await seleccionarImagen();
            if (uri) setImagenUri(uri);
          },
        },
        {
          text: "Tomar Foto",
          onPress: async () => {
            const uri = await tomarFoto();
            if (uri) setImagenUri(uri);
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleGuardar = async () => {
    if (!plan) return;

    // VALIDACIONES
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert("Error", "El nombre y precio son obligatorios");
      return;
    }

    const precioNumero = parseFloat(precio);
    if (isNaN(precioNumero) || precioNumero <= 0) {
      Alert.alert("Error", "El precio debe ser un número válido mayor a 0");
      return;
    }

    setCargando(true);

    // Subir nueva imagen si cambió
    let imagenUrl = imagenUri;
    if (imagenUri && imagenUri !== plan.imagen_url) {
      const nuevaUrl = await subirImagen(imagenUri);
      if (nuevaUrl) imagenUrl = nuevaUrl;
    }

    // Actualizar plan
    const resultado = await actualizar(plan.id, {
      nombre: nombre.trim(),
      precio: precioNumero,
      datos_gb: datosGb.trim() || undefined,
      minutos_voz: minutosVoz.trim() || undefined,
      sms: sms.trim() || undefined,
      velocidad_4g: velocidad4g.trim() || undefined,
      velocidad_5g: velocidad5g.trim() || undefined,
      redes_sociales: redesSociales.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      llamadas_internacionales: llamadasInternacionales.trim() || undefined,
      roaming: roaming.trim() || undefined,
      segmento: segmento.trim() || undefined,
      publico_objetivo: publicoObjetivo.trim() || undefined,
      imagen_url: imagenUrl || undefined,
    });

    setCargando(false);

    if (resultado.success) {
      Alert.alert("¡Éxito!", "Plan actualizado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo actualizar el plan");
    }
  };

  if (!plan) {
    return (
      <View style={globalStyles.containerCentered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!esAsesor || plan.asesor_id !== usuario?.id) {
    return (
      <View style={globalStyles.containerCentered}>
        <Ionicons name="lock-closed-outline" size={80} color={colors.textTertiary} />
        <Text style={globalStyles.emptyState}>
          No tienes permiso para editar este plan
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* IMAGEN */}
        <Text style={styles.label}>Imagen del Plan</Text>
        {imagenUri ? (
          <Image source={{ uri: imagenUri }} style={styles.vistaPrevia} />
        ) : (
          <View style={styles.sinImagen}>
            <Ionicons name="image-outline" size={60} color={colors.textTertiary} />
            <Text style={globalStyles.textTertiary}>Sin imagen</Text>
          </View>
        )}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonOutline]}
          onPress={handleSeleccionarImagen}
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={globalStyles.buttonTextOutline}> Cambiar Imagen</Text>
        </TouchableOpacity>

        {/* INFORMACIÓN BÁSICA */}
        <Text style={styles.seccionTitulo}>📋 Información Básica</Text>

        <Text style={styles.label}>Nombre del Plan *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Plan Smart 5GB"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Precio Mensual (USD) *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: 15.99"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Segmento</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Básico / Medio / Premium"
          value={segmento}
          onChangeText={setSegmento}
        />

        <Text style={styles.label}>Público Objetivo</Text>
        <TextInput
          style={[globalStyles.input, globalStyles.inputMultiline]}
          placeholder="Ej: Usuarios casuales, estudiantes"
          value={publicoObjetivo}
          onChangeText={setPublicoObjetivo}
          multiline
          numberOfLines={2}
        />

        {/* CARACTERÍSTICAS */}
        <Text style={styles.seccionTitulo}>📦 Características</Text>

        <Text style={styles.label}>Datos Móviles</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: 5 GB mensuales (4G LTE)"
          value={datosGb}
          onChangeText={setDatosGb}
        />

        <Text style={styles.label}>Minutos de Voz</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: 100 minutos nacionales"
          value={minutosVoz}
          onChangeText={setMinutosVoz}
        />

        <Text style={styles.label}>SMS</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Ilimitados a nivel nacional"
          value={sms}
          onChangeText={setSms}
        />

        {/* VELOCIDADES */}
        <Text style={styles.seccionTitulo}>⚡ Velocidad</Text>

        <Text style={styles.label}>Velocidad 4G</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Hasta 50 Mbps"
          value={velocidad4g}
          onChangeText={setVelocidad4g}
        />

        <Text style={styles.label}>Velocidad 5G</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Hasta 300 Mbps"
          value={velocidad5g}
          onChangeText={setVelocidad5g}
        />

        {/* APLICACIONES */}
        <Text style={styles.seccionTitulo}>📱 Aplicaciones</Text>

        <Text style={styles.label}>Redes Sociales</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Facebook, Instagram, TikTok GRATIS"
          value={redesSociales}
          onChangeText={setRedesSociales}
        />

        <Text style={styles.label}>WhatsApp</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: Ilimitado (no consume datos)"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        {/* INTERNACIONAL */}
        <Text style={styles.seccionTitulo}>🌎 Internacional</Text>

        <Text style={styles.label}>Llamadas Internacionales</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: $0.15/min"
          value={llamadasInternacionales}
          onChangeText={setLlamadasInternacionales}
        />

        <Text style={styles.label}>Roaming</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ej: 500 MB incluidos (Sudamérica)"
          value={roaming}
          onChangeText={setRoaming}
        />

        {/* BOTONES */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonGuardar,
          ]}
          onPress={handleGuardar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  vistaPrevia: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.borderLight,
  },
  sinImagen: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  seccionTitulo: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  botonGuardar: {
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});