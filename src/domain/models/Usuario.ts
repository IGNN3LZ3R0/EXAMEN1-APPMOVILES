export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  rol: "asesor_comercial" | "usuario_registrado";
  created_at?: string;
}