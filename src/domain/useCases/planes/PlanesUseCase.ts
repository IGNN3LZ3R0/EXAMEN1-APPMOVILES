import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../data/services/supabaseClient";
import { PlanMovil } from "../../models/PlanMovil";

export class PlanesUseCase {
  private readonly BUCKET_NAME = "planes-imagenes";

  /**
   * Obtener todos los planes activos (para usuarios e invitados)
   */
  async obtenerPlanes(): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("activo", true)
        .order("precio", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener planes:", error);
      return [];
    }
  }

  /**
   * Obtener planes por asesor (solo para asesores)
   */
  async obtenerPlanesPorAsesor(asesorId: string): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("asesor_id", asesorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener planes del asesor:", error);
      return [];
    }
  }

  /**
   * Obtener plan por ID
   */
  async obtenerPlanPorId(id: string): Promise<PlanMovil | null> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al obtener plan:", error);
      return null;
    }
  }

  /**
   * Crear plan (solo asesores)
   */
  async crearPlan(plan: Omit<PlanMovil, "id" | "created_at">): Promise<{ success: boolean; error?: string; plan?: PlanMovil }> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return { success: true, plan: data };
    } catch (error: any) {
      console.error("Error al crear plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar plan (solo asesores)
   */
  async actualizarPlan(
    id: string,
    plan: Partial<PlanMovil>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("planes_moviles")
        .update(plan)
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar plan (soft delete - solo asesores)
   */
  async eliminarPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Obtener imagen para eliminar
      const { data: plan } = await supabase
        .from("planes_moviles")
        .select("imagen_url")
        .eq("id", id)
        .single();

      // Eliminar imagen si existe
      if (plan?.imagen_url) {
        await this.eliminarImagen(plan.imagen_url);
      }

      // Soft delete
      const { error } = await supabase
        .from("planes_moviles")
        .update({ activo: false })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error al eliminar plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subir imagen usando FormData
   */
  async subirImagen(uri: string): Promise<string | null> {
    try {
      const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
      const nombreArchivo = `planes/${Date.now()}.${extension}`;

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: nombreArchivo,
        type: `image/${extension}`,
      } as any);

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(nombreArchivo, formData, {
          contentType: `image/${extension}`,
          cacheControl: "3600",
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(nombreArchivo);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      return null;
    }
  }

  /**
   * Eliminar imagen del bucket
   */
  private async eliminarImagen(url: string): Promise<void> {
    try {
      const nombreArchivo = url.split("/").pop();
      if (!nombreArchivo) return;

      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([`planes/${nombreArchivo}`]);
    } catch (error) {
      console.warn("Error al eliminar imagen:", error);
    }
  }

  /**
   * Seleccionar imagen de galería
   */
  async seleccionarImagen(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Necesitamos permisos para acceder a tus fotos");
        return null;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        return resultado.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      return null;
    }
  }

  /**
   * Tomar foto con cámara
   */
  async tomarFoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Necesitamos permisos para acceder a la cámara");
        return null;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        return resultado.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error al tomar foto:", error);
      return null;
    }
  }
}