import { useEffect, useState } from "react";
import { Usuario } from "../../domain/models/Usuario";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

const authUseCase = new AuthUseCase();

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();

    const { data: subscription } = authUseCase.onAuthStateChange((user) => {
      setUsuario(user);
      setCargando(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    const user = await authUseCase.obtenerUsuarioActual();
    setUsuario(user);
    setCargando(false);
  };

  const registrar = async (email: string, password: string, nombre: string, telefono: string) => {
    return await authUseCase.registrar(email, password, nombre, telefono);
  };

  const iniciarSesion = async (email: string, password: string) => {
    return await authUseCase.iniciarSesion(email, password);
  };

  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  const actualizarPerfil = async (nombre: string, telefono?: string) => {
    const resultado = await authUseCase.actualizarPerfil(nombre, telefono);
    if (resultado.success) {
      await verificarSesion();
    }
    return resultado;
  };

  const restablecerContrasena = async (email: string) => {
    return await authUseCase.restablecerContrasena(email);
  };

  const actualizarContrasena = async (nuevaContrasena: string) => {
    return await authUseCase.actualizarContrasena(nuevaContrasena);
  };

  // NUEVA FUNCIÓN: Verificar contraseña actual sin crear nueva sesión
  const verificarContrasenaActual = async (password: string) => {
    return await authUseCase.verificarContrasenaActual(password);
  };

  return {
    usuario,
    cargando,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    restablecerContrasena,
    actualizarContrasena,
    verificarContrasenaActual, // Nueva función exportada
    esAsesor: usuario?.rol === "asesor_comercial",
  };
}