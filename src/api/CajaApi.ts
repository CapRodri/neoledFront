// src/api/CajaApi.ts
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendTransaccionCaja {
  idtransaccion: number;
  idestado_caja: number;
  tipo_movimiento: string;
  descripcion: string;
  monto: string;
  fecha: string;
  idusuario: number;
  idventa: number | null;
  nombres: string;
  apellidos: string;
}

export interface TransaccionCaja {
  idtransaccion: number;
  idestado_caja: number;
  tipo_movimiento: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  idusuario: number;
  idventa: number | null;
  empleado: string;
}

export interface EstadoCaja {
  idestado_caja: number;
  estado: string;
  monto_inicial: number;
  monto_final: number;
  idusuario: number;
}

interface SaldoActualResponse {
  estado: string;
  monto_final: string;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Obtener todas las transacciones de caja (para Admin)
export const getTransaccionesCaja = async (): Promise<TransaccionCaja[]> => {
  try {
    const response = await api.get<BackendTransaccionCaja[]>("/caja/transacciones");
    return response.data.map((transaccion) => ({
      idtransaccion: transaccion.idtransaccion,
      idestado_caja: transaccion.idestado_caja,
      tipo_movimiento: transaccion.tipo_movimiento,
      descripcion: transaccion.descripcion,
      monto: parseFloat(transaccion.monto),
      fecha: new Date(transaccion.fecha),
      idusuario: transaccion.idusuario,
      idventa: transaccion.idventa,
      empleado: `${transaccion.nombres} ${transaccion.apellidos}`,
    }));
  } catch (error) {
    console.error("Error fetching transacciones caja:", error);
    throw new Error("No se pudieron cargar las transacciones de caja");
  }
};

// Obtener transacciones de caja por usuario (para Asistente)
export const getTransaccionesCajaByUsuario = async (idusuario: number): Promise<TransaccionCaja[]> => {
  try {
    const response = await api.get<BackendTransaccionCaja[]>(`/caja/transacciones/usuario/${idusuario}`);
    return response.data.map((transaccion) => ({
      idtransaccion: transaccion.idtransaccion,
      idestado_caja: transaccion.idestado_caja,
      tipo_movimiento: transaccion.tipo_movimiento,
      descripcion: transaccion.descripcion,
      monto: parseFloat(transaccion.monto),
      fecha: new Date(transaccion.fecha),
      idusuario: transaccion.idusuario,
      idventa: transaccion.idventa,
      empleado: `${transaccion.nombres} ${transaccion.apellidos}`,
    }));
  } catch (error) {
    console.error("Error fetching transacciones caja por usuario:", error);
    throw new Error("No se pudieron cargar las transacciones de caja");
  }
};

// Obtener estado actual de caja
export const getEstadoCajaActual = async (): Promise<EstadoCaja | null> => {
  try {
    const response = await api.get<EstadoCaja>("/caja/estado-actual");
    return {
      ...response.data,
      monto_inicial: parseFloat(response.data.monto_inicial as any),
      monto_final: parseFloat(response.data.monto_final as any),
    };
  } catch (error) {
    console.error("Error fetching estado caja:", error);
    return null;
  }
};

// Obtener saldo actual (monto_final de estado_caja)
export const getSaldoActual = async (): Promise<SaldoActualResponse> => {
  try {
    const response = await api.get<SaldoActualResponse>("/caja/saldo-actual");
    return response.data;
  } catch (error) {
    console.error("Error fetching saldo actual:", error);
    // Retornar valores por defecto en caso de error
    return {
      estado: "cerrada",
      monto_final: "0.00"
    };
  }
};

// Obtener usuarios únicos para filtros
export const getUsuariosCaja = async (): Promise<string[]> => {
  try {
    const response = await api.get<string[]>("/caja/usuarios");
    return response.data;
  } catch (error) {
    console.error("Error fetching usuarios caja:", error);
    throw new Error("No se pudieron cargar los usuarios");
  }
};

// Obtener información del usuario actual (simulado para demo)
export const getCurrentUser = async (): Promise<{ idusuario: number; rol: string; nombres: string; apellidos: string }> => {
  // En una aplicación real, esto vendría del contexto de autenticación
  // Por ahora simulamos un usuario para demo
  return {
    idusuario: 1,
    rol: "Admin", // Cambiar a "Asistente" para probar el otro rol
    nombres: "Juan",
    apellidos: "Pérez"
  };
};