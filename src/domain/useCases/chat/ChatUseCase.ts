import { supabase } from "@/src/data/services/supabaseClient";
import { Contratacion } from "../../models/Contratacion";

export class ContratacionesUseCase {
  /**
   * Crear solicitud de contratación (usuarios registrados)
   */
  async crearContratacion(
    usuarioId: string,
    planId: string,
    notasUsuario?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("contrataciones").insert({
        usuario_id: usuarioId,
        plan_id: planId,
        estado: "pendiente",
        notas_usuario: notasUsuario,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al crear contratación:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener contrataciones del usuario
   */
  async obtenerContratacionesPorUsuario(usuarioId: string): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:plan_id(*)
        `)
        .eq("usuario_id", usuarioId)
        .order("fecha_solicitud", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      return [];
    }
  }

  /**
   * Obtener todas las contrataciones (asesores)
   */
  async obtenerTodasLasContrataciones(): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:plan_id(*),
          usuario:usuario_id(email, nombre)
        `)
        .order("fecha_solicitud", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener contrataciones:", error);
      return [];
    }
  }

  /**
   * Obtener contrataciones pendientes (asesores)
   */
  async obtenerContratacionesPendientes(): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:plan_id(*),
          usuario:usuario_id(email, nombre)
        `)
        .eq("estado", "pendiente")
        .order("fecha_solicitud", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener contrataciones pendientes:", error);
      return [];
    }
  }

  /**
   * Actualizar estado de contratación (asesores)
   */
  async actualizarEstadoContratacion(
    contratacionId: string,
    estado: "aprobada" | "rechazada",
    asesorId: string,
    notasAsesor?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("contrataciones")
        .update({
          estado,
          asesor_id: asesorId,
          fecha_respuesta: new Date().toISOString(),
          notas_asesor: notasAsesor,
        })
        .eq("id", contratacionId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar contratación:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancelar contratación (usuarios)
   */
  async cancelarContratacion(contratacionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("contrataciones")
        .update({ estado: "rechazada" })
        .eq("id", contratacionId)
        .eq("estado", "pendiente"); // Solo si está pendiente

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al cancelar contratación:", error);
      return { success: false, error: error.message };
    }
  }
}