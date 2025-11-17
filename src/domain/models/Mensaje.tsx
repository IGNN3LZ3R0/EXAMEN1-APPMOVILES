import { PlanMovil } from "./PlanMovil";
import { Usuario } from "./Usuario";

export interface Contratacion {
  id: string;
  usuario_id: string;
  plan_id: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  fecha_solicitud: string;
  fecha_respuesta?: string;
  asesor_id?: string;
  notas_usuario?: string;
  notas_asesor?: string;
  
  // Relaciones (datos cargados via joins)
  plan?: PlanMovil;
  usuario?: Usuario;
  asesor?: Usuario;
}