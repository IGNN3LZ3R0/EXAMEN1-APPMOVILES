import { Mensaje } from "@/src/domain/models/Mensaje";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useChat } from "@/src/presentation/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { globalStyles } from "@/src/presentation/styles/globalStyles";
import { borderRadius, colors, fontSize, spacing } from "@/src/presentation/styles/theme";

export default function ChatScreen() {
    const { usuario, esAsesor } = useAuth();
    const router = useRouter();
    const [receptorId, setReceptorId] = useState<string | null>(null);
    const [receptorInfo, setReceptorInfo] = useState<{ email: string; rol: string } | null>(null);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState<
        Array<{ id: string; email: string; rol: string }>
    >([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true);

    const { mensajes, cargando, enviando, enviarMensaje, quienEscribe, notificarEscritura, obtenerUsuariosDisponibles } =
        useChat(receptorId || undefined);

    const [textoMensaje, setTextoMensaje] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Cargar usuarios al montar
    useEffect(() => {
        if (usuario) {
            cargarYSeleccionarUsuario();
        }
    }, [usuario]);

    // Scroll automático
    useEffect(() => {
        if (mensajes.length > 0 && receptorId) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [mensajes, receptorId]);

    const cargarYSeleccionarUsuario = async () => {
        setCargandoUsuarios(true);
        const usuarios = await obtenerUsuariosDisponibles();
        setUsuariosDisponibles(usuarios);

        // Si solo hay un usuario, seleccionarlo automáticamente
        if (usuarios.length === 1) {
            const usuarioUnico = usuarios[0];
            setReceptorId(usuarioUnico.id);
            setReceptorInfo({
                email: usuarioUnico.email,
                rol: usuarioUnico.rol,
            });
        }

        setCargandoUsuarios(false);
    };

    const seleccionarUsuario = (usuario: { id: string; email: string; rol: string }) => {
        setReceptorId(usuario.id);
        setReceptorInfo({
            email: usuario.email,
            rol: usuario.rol,
        });
    };

    const handleEnviar = async () => {
        if (!textoMensaje.trim() || enviando) return;

        if (!receptorId) {
            Alert.alert("Error", "No hay un receptor seleccionado");
            return;
        }

        const mensaje = textoMensaje;
        setTextoMensaje("");

        const resultado = await enviarMensaje(mensaje);

        if (!resultado.success) {
            Alert.alert("Error", resultado.error || "No se pudo enviar el mensaje");
            setTextoMensaje(mensaje);
        }
    };

    const renderMensaje = ({ item }: { item: Mensaje }) => {
        const esMio = item.emisor_id === usuario?.id;
        const emailCompleto = item.emisor?.email || "Usuario";
        const nombreUsuario = emailCompleto.split("@")[0];
        const rolUsuario = item.emisor?.rol || "usuario_registrado";
        const esAsesorMensaje = rolUsuario === "asesor_comercial";

        return (
            <View style={[styles.mensajeContainer, esMio ? styles.mensajeMio : styles.mensajeOtro]}>
                {!esMio && (
                    <View style={styles.etiquetaUsuario}>
                        <Ionicons name={esAsesorMensaje ? "briefcase" : "person"} size={12} color={colors.primary} />
                        <Text style={styles.nombreUsuario}>{esAsesorMensaje ? "Asesor" : "Usuario"}</Text>
                        <Text style={styles.emailUsuario}>({nombreUsuario})</Text>
                    </View>
                )}

                <Text style={[styles.contenidoMensaje, esMio && styles.contenidoMensajeMio]}>{item.contenido}</Text>

                <View style={styles.pieMensaje}>
                    <Text style={[styles.horaMensaje, esMio && styles.horaMensajeMio]}>
                        {new Date(item.created_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                    {esMio && (
                        <Ionicons
                            name={item.leido ? "checkmark-done" : "checkmark"}
                            size={14}
                            color={item.leido ? colors.success : "rgba(255, 255, 255, 0.7)"}
                        />
                    )}
                </View>
            </View>
        );
    };

    // PANTALLA: Requiere login
    if (!usuario) {
        return (
            <View style={globalStyles.containerCentered}>
                <Ionicons name="lock-closed-outline" size={80} color={colors.textTertiary} />
                <Text style={globalStyles.emptyState}>Debes iniciar sesión</Text>
                <Text style={[globalStyles.textSecondary, { textAlign: "center", marginTop: spacing.sm }]}>
                    Inicia sesión para chatear con {esAsesor ? "usuarios" : "asesores"}
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

    // PANTALLA: Cargando usuarios
    if (cargandoUsuarios) {
        return (
            <View style={globalStyles.container}>
                <View style={globalStyles.header}>
                    <Text style={styles.titulo}>Chat</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.textoCargando}>Cargando...</Text>
                </View>
            </View>
        );
    }

    // PANTALLA: Selector de usuario
    if (!receptorId && usuariosDisponibles.length > 1) {
        return (
            <View style={globalStyles.container}>
                <View style={globalStyles.header}>
                    <Text style={styles.titulo}>Selecciona con quién chatear</Text>
                </View>

                <FlatList
                    data={usuariosDisponibles}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.md }}
                    renderItem={({ item }) => {
                        const nombreUsuario = item.email.split("@")[0];
                        const esAsesorItem = item.rol === "asesor_comercial";

                        return (
                            <TouchableOpacity style={styles.usuarioItem} onPress={() => seleccionarUsuario(item)}>
                                <View style={[styles.avatarUsuario, esAsesorItem && styles.avatarAsesor]}>
                                    <Ionicons name={esAsesorItem ? "briefcase" : "person"} size={24} color={colors.white} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nombreUsuarioItem}>{esAsesorItem ? "Asesor" : "Usuario"}</Text>
                                    <Text style={styles.emailUsuarioItem}>{nombreUsuario}</Text>
                                </View>
                                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        );
    }

    // PANTALLA: Sin usuarios disponibles
    if (!receptorId && usuariosDisponibles.length === 0) {
        return (
            <View style={globalStyles.container}>
                <View style={globalStyles.header}>
                    <Text style={styles.titulo}>Chat</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={80} color={colors.textTertiary} />
                    <Text style={globalStyles.emptyState}>
                        No hay {esAsesor ? "usuarios" : "asesores"} disponibles
                    </Text>
                </View>
            </View>
        );
    }

    // PANTALLA: Chat activo
    if (cargando) {
        return (
            <View style={globalStyles.container}>
                <View style={globalStyles.header}>
                    <Text style={styles.titulo}>Chat</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.textoCargando}>Cargando mensajes...</Text>
                </View>
            </View>
        );
    }

    const nombreReceptor = receptorInfo?.email.split("@")[0] || "Usuario";
    const esAsesorReceptor = receptorInfo?.rol === "asesor_comercial";

    return (
        <KeyboardAvoidingView
            style={globalStyles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {/* HEADER DEL CHAT */}
            <View style={styles.headerChat}>
                {usuariosDisponibles.length > 1 && (
                    <TouchableOpacity
                        onPress={() => {
                            setReceptorId(null);
                            setReceptorInfo(null);
                        }}
                        style={styles.botonVolver}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                )}
                <View style={styles.avatarHeader}>
                    <Ionicons name={esAsesorReceptor ? "briefcase" : "person"} size={20} color={colors.white} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerNombre}>{esAsesorReceptor ? "Asesor" : "Usuario"}</Text>
                    <Text style={styles.headerEmail}>{nombreReceptor}</Text>
                </View>
            </View>

            {/* LISTA DE MENSAJES */}
            {mensajes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={80} color={colors.textTertiary} />
                    <Text style={globalStyles.emptyState}>No hay mensajes aún</Text>
                    <Text style={[globalStyles.textSecondary, { textAlign: "center", marginTop: spacing.sm }]}>
                        Envía el primer mensaje para comenzar la conversación
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={mensajes}
                    renderItem={renderMensaje}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            {/* INDICADOR DE ESCRITURA */}
            {quienEscribe && quienEscribe !== usuario?.email && (
                <View style={styles.typingContainer}>
                    <Text style={styles.typingText}>Escribiendo...</Text>
                </View>
            )}

            {/* INPUT DE MENSAJE */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={textoMensaje}
                    onChangeText={(texto) => {
                        setTextoMensaje(texto);
                        if (usuario?.email && texto.trim()) {
                            notificarEscritura(usuario.email);
                        }
                    }}
                    placeholder="Escribe un mensaje..."
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.botonEnviar, (!textoMensaje.trim() || enviando) && styles.botonDeshabilitado]}
                    onPress={handleEnviar}
                    disabled={!textoMensaje.trim() || enviando}
                >
                    {enviando ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={20} color="#FFF" />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    titulo: {
        fontSize: fontSize.xl,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textoCargando: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
    },
    usuarioItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    avatarUsuario: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    avatarAsesor: {
        backgroundColor: colors.primary,
    },
    nombreUsuarioItem: {
        fontSize: fontSize.md,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    emailUsuarioItem: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    headerChat: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    botonVolver: {
        marginRight: spacing.sm,
    },
    avatarHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.sm,
    },
    headerInfo: {
        flex: 1,
    },
    headerNombre: {
        fontSize: fontSize.md,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    headerEmail: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    listContainer: {
        padding: spacing.md,
    },
    mensajeContainer: {
        maxWidth: "75%",
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    mensajeMio: {
        alignSelf: "flex-end",
        backgroundColor: colors.primary,
    },
    mensajeOtro: {
        alignSelf: "flex-start",
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    etiquetaUsuario: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: spacing.xs,
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    nombreUsuario: {
        fontSize: fontSize.xs,
        fontWeight: "700",
        color: colors.primary,
    },
    emailUsuario: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontStyle: "italic",
    },
    contenidoMensaje: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    contenidoMensajeMio: {
        color: colors.white,
    },
    pieMensaje: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: spacing.xs,
    },
    horaMensaje: {
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    horaMensajeMio: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    typingContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    typingText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontStyle: "italic",
    },
    inputContainer: {
        flexDirection: "row",
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
        borderRadius: borderRadius.round,
        fontSize: fontSize.md,
    },
    botonEnviar: {
        marginLeft: spacing.sm,
        width: 44,
        height: 44,
        backgroundColor: colors.primary,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    botonDeshabilitado: {
        backgroundColor: colors.borderLight,
    },
});