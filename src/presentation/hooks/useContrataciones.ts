import { useEffect, useState } from "react";
import { Contratacion } from "../../domain/models/Contratacion";
import { ContratacionesUseCase } from "../../domain/useCases/contrataciones/ContratacionesUseCase";

const contratacionesUseCase = new ContratacionesUseCase();

export function useContrataciones(usuarioId?: string, esAsesor: boolean = false) {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (usuarioId || esAsesor) {
      cargarContrataciones();
    }
  }, [usuarioId, esAsesor]);

  const cargarContrataciones = async () => {
    setCargando(true);
    let data: Contratacion[];
    
    if (esAsesor) {
      data = await contratacionesUseCase.obtenerTodasLasContrataciones();
    } else if (usuarioId) {
      data = await contratacionesUseCase.obtenerContratacionesPorUsuario(usuarioId);
    } else {
      data = [];
    }
    
    setContrataciones(data);
    setCargando(false);
  };

  const cargarPendientes = async () => {
    setCargando(true);
    const data = await contratacionesUseCase.obtenerContratacionesPendientes();
    setContrataciones(data);
    setCargando(false);
  };

  const crear = async (usuarioId: string, planId: string, notasUsuario?: string) => {
    const resultado = await contratacionesUseCase.crearContratacion(usuarioId, planId, notasUsuario);
    if (resultado.success) {
      await cargarContrataciones();
    }
    return resultado;
  };

  const actualizarEstado = async (
    contratacionId: string,
    estado: "aprobada" | "rechazada",
    asesorId: string,
    notasAsesor?: string
  ) => {
    const resultado = await contratacionesUseCase.actualizarEstadoContratacion(
      contratacionId,
      estado,
      asesorId,
      notasAsesor
    );
    if (resultado.success) {
      await cargarContrataciones();
    }
    return resultado;
  };

  const cancelar = async (contratacionId: string) => {
    const resultado = await contratacionesUseCase.cancelarContratacion(contratacionId);
    if (resultado.success) {
      await cargarContrataciones();
    }
    return resultado;
  };

  return {
    contrataciones,
    cargando,
    cargarContrataciones,
    cargarPendientes,
    crear,
    actualizarEstado,
    cancelar,
  };
}