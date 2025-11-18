import { supabase } from "@/src/data/services/supabaseClient";
import { Usuario } from "../../models/Usuario";

export class AuthUseCase {
  // URL para deep links
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
   * Actualizar contraseña (NO CIERRA SESIÓN)
   */
  async actualizarContrasena(nuevaContrasena: string) {
    try {
      console.log("🔐 Actualizando contraseña...");
      
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena,
      });

      if (error) {
        console.error("❌ Error al actualizar:", error);
        throw error;
      }

      console.log("✅ Contraseña actualizada exitosamente");
      
      // NO cerrar sesión, solo actualizar
      return { success: true };
    } catch (error: any) {
      console.error("❌ Error al actualizar contraseña:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar contraseña actual
   * IMPORTANTE: Esta función NO debe afectar la sesión actual
   */
  async verificarContrasenaActual(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { success: false, error: "No hay usuario autenticado" };
      }

      console.log("🔍 Verificando contraseña para:", user.email);

      // Guardar la sesión actual
      const { data: { session: sessionActual } } = await supabase.auth.getSession();
      
      // Intentar login temporal para verificar
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        console.log("❌ Contraseña incorrecta");
        return { success: false, error: "Contraseña incorrecta" };
      }

      console.log("✅ Contraseña verificada correctamente");
      
      // Restaurar la sesión original si es diferente
      if (sessionActual && data.session && sessionActual.access_token !== data.session.access_token) {
        await supabase.auth.setSession({
          access_token: sessionActual.access_token,
          refresh_token: sessionActual.refresh_token,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error("❌ Error al verificar contraseña:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (usuario: Usuario | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth event:", event);
      
      if (session?.user) {
        const usuario = await this.obtenerUsuarioActual();
        callback(usuario);
      } else {
        callback(null);
      }
    });
  }
}