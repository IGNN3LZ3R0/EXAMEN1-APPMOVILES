import { supabase } from "@/src/data/services/supabaseClient";
import { Usuario } from "../../models/Usuario";

export class AuthUseCase {
  // URL fija para production
  private readonly REDIRECT_URL = "tigoplanes://auth-callback";

  /**
   * Registrar nuevo usuario con nombre y teléfono
   */
  async registrar(email: string, password: string, nombre: string, telefono: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            rol: "usuario_registrado",
            nombre,
            telefono,
          },
          emailRedirectTo: this.REDIRECT_URL,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Iniciar sesión
   */
  async iniciarSesion(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con información completa
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("⚠️ Error al obtener usuario de tabla:", error);
        return {
          id: user.id,
          email: user.email || "",
          rol: "usuario_registrado",
        };
      }

      return data as Usuario;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async actualizarPerfil(nombre: string, telefono?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const actualizacion: any = { nombre };
      if (telefono !== undefined) {
        actualizacion.telefono = telefono;
      }

      const { error } = await supabase
        .from("usuarios")
        .update(actualizacion)
        .eq("id", user.id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restablecer contraseña (enviar email)
   */
  async restablecerContrasena(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: this.REDIRECT_URL,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar contraseña
   */
  async actualizarContrasena(nuevaContrasena: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar contraseña:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (usuario: Usuario | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const usuario = await this.obtenerUsuarioActual();
        callback(usuario);
      } else {
        callback(null);
      }
    });
  }
}