import { supabase } from "@/src/data/services/supabaseClient";
import { Usuario } from "../../models/Usuario";

export class AuthUseCase {
  /**
   * Registrar nuevo usuario con nombre completo y teléfono
   */
  async registrar(
    email: string, 
    password: string, 
    nombreCompleto: string, 
    telefono: string
  ) {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            rol: "usuario_registrado",
            nombre: nombreCompleto,
            telefono: telefono,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 2. Esperar a que el trigger cree la fila en la tabla usuarios
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 3. Actualizar la tabla usuarios con nombre y teléfono
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ 
          nombre: nombreCompleto,
          telefono: telefono 
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.warn("⚠️ Error al actualizar datos adicionales:", updateError);
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      
      // Mensajes de error más amigables
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "Este correo ya está registrado. Por favor inicia sesión.";
      } else if (error.message.includes("password")) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      
      return { success: false, error: errorMessage };
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
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email o contraseña incorrectos.";
      }
      return { success: false, error: errorMessage };
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
   * Actualizar perfil del usuario (nombre y teléfono)
   */
  async actualizarPerfil(nombre: string, telefono?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const updateData: any = { nombre };
      if (telefono) {
        updateData.telefono = telefono;
      }

      const { error } = await supabase
        .from("usuarios")
        .update(updateData)
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
        redirectTo: "tigoplanes://reset-password",
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