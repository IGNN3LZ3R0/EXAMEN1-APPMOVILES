import { useEffect, useState } from "react";
import { PlanMovil } from "../../domain/models/PlanMovil";
import { PlanesUseCase } from "../../domain/useCases/planes/PlanesUseCase";

const planesUseCase = new PlanesUseCase();

export function usePlanes(asesorId?: string) {
  const [planes, setPlanes] = useState<PlanMovil[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPlanes();
  }, [asesorId]);

  const cargarPlanes = async () => {
    setCargando(true);
    let data: PlanMovil[];
    
    if (asesorId) {
      data = await planesUseCase.obtenerPlanesPorAsesor(asesorId);
    } else {
      data = await planesUseCase.obtenerPlanes();
    }
    
    setPlanes(data);
    setCargando(false);
  };

  const crear = async (plan: Omit<PlanMovil, "id" | "created_at">) => {
    const resultado = await planesUseCase.crearPlan(plan);
    if (resultado.success) {
      await cargarPlanes();
    }
    return resultado;
  };

  const actualizar = async (id: string, plan: Partial<PlanMovil>) => {
    const resultado = await planesUseCase.actualizarPlan(id, plan);
    if (resultado.success) {
      await cargarPlanes();
    }
    return resultado;
  };

  const eliminar = async (id: string) => {
    const resultado = await planesUseCase.eliminarPlan(id);
    if (resultado.success) {
      await cargarPlanes();
    }
    return resultado;
  };

  const subirImagen = async (uri: string) => {
    return await planesUseCase.subirImagen(uri);
  };

  const seleccionarImagen = async () => {
    return await planesUseCase.seleccionarImagen();
  };

  const tomarFoto = async () => {
    return await planesUseCase.tomarFoto();
  };

  return {
    planes,
    cargando,
    cargarPlanes,
    crear,
    actualizar,
    eliminar,
    subirImagen,
    seleccionarImagen,
    tomarFoto,
  };
}