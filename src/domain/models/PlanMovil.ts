export interface PlanMovil {
  id: string;
  nombre: string;
  precio: number;
  datos_gb?: string;
  minutos_voz?: string;
  sms?: string;
  velocidad_4g?: string;
  velocidad_5g?: string;
  redes_sociales?: string;
  whatsapp?: string;
  llamadas_internacionales?: string;
  roaming?: string;
  segmento?: string;
  publico_objetivo?: string;
  imagen_url?: string;
  activo: boolean;
  asesor_id?: string;
  created_at: string;
}