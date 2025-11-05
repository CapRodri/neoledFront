import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Interfaces para Productos Más Vendidos
interface BackendProductoMasVendido {
  idvariante: number;
  nombre_producto: string;
  nombre_variante: string;
  categoria: string;
  cantidad_vendida: number;
  ingresos: string;
}

export interface ProductoMasVendido {
  id: number;
  producto: string;
  categoria: string;
  cantidadVendida: number;
  ingresos: number;
}

// Interfaces para Productos Sin Vender
interface BackendProductoSinVender {
  idvariante: number;
  nombre_producto: string;
  nombre_variante: string;
  categoria: string;
  fecha_agregado: string;
  ultima_venta: string | null;
  dias_sin_vender: number;
}

export interface ProductoSinVender {
  id: number;
  producto: string;
  categoria: string;
  fechaAgregado: Date;
  ultimaVenta: Date | null;
  diasSinVender: number;
}

// Interfaces para Análisis de Productos
interface BackendProductoAnalisis {
  idvariante: number;
  nombre_producto: string;
  nombre_variante: string;
  categoria: string;
  precio_venta: string;
  precio_compra: string;
  cantidad_vendida: number;
  mes: number;
  año: number;
}

export interface ProductoAnalisis {
  id: number;
  nombre: string;
  categoria: string;
  precioVenta: number;
  precioCompra: number;
  cantidadVendida: number;
  mes: string;
  año: string;
}

// Interfaces para Objetivos
interface BackendObjetivo {
  idobjetivo: number;
  mes: number;
  año: number;
  monto: string;
}

export interface Objetivo {
  idObjetivo: number;
  mes: number;
  año: number;
  monto: number;
}

export interface ObjetivoRequest {
  mes: number;
  año: number;
  monto: number;
}

// Interfaces para Ventas Mensuales
interface BackendVentaMensual {
  mes: number;
  año: number;
  total_ventas: number;
  total_ingresos: string;
}

export interface VentaMensual {
  mes: number;
  año: number;
  totalVentas: number;
  totalIngresos: number;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Productos Más Vendidos
export const getProductosMasVendidos = async (mes?: number, año?: number): Promise<ProductoMasVendido[]> => {
  try {
    const params: any = {};
    if (mes) params.mes = mes;
    if (año) params.año = año;
    
    const response = await api.get<BackendProductoMasVendido[]>("/reportes/productos-mas-vendidos", { params });
    
    return response.data.map((producto, index) => ({
      id: producto.idvariante,
      producto: `${producto.nombre_producto} - ${producto.nombre_variante}`,
      categoria: producto.categoria,
      cantidadVendida: producto.cantidad_vendida,
      ingresos: parseFloat(producto.ingresos),
    }));
  } catch (error) {
    console.error("Error fetching productos más vendidos:", error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
};

// Productos Sin Vender
export const getProductosSinVender = async (): Promise<ProductoSinVender[]> => {
  try {
    const response = await api.get<BackendProductoSinVender[]>("/reportes/productos-sin-vender");
    
    return response.data.map((producto, index) => ({
      id: producto.idvariante,
      producto: `${producto.nombre_producto} - ${producto.nombre_variante}`,
      categoria: producto.categoria,
      fechaAgregado: new Date(producto.fecha_agregado),
      ultimaVenta: producto.ultima_venta ? new Date(producto.ultima_venta) : null,
      diasSinVender: producto.dias_sin_vender,
    }));
  } catch (error) {
    console.error("Error fetching productos sin vender:", error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
};

// Análisis de Productos
export const getAnalisisProductos = async (mes: number, año: number): Promise<ProductoAnalisis[]> => {
  try {
    const response = await api.get<BackendProductoAnalisis[]>("/reportes/analisis-productos", {
      params: { mes, año }
    });
    
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    return response.data.map((producto, index) => ({
      id: producto.idvariante,
      nombre: `${producto.nombre_producto} - ${producto.nombre_variante}`,
      categoria: producto.categoria,
      precioVenta: parseFloat(producto.precio_venta),
      precioCompra: parseFloat(producto.precio_compra),
      cantidadVendida: producto.cantidad_vendida,
      mes: meses[producto.mes - 1],
      año: producto.año.toString(),
    }));
  } catch (error) {
    console.error("Error fetching análisis de productos:", error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
};

// Objetivos
export const getObjetivos = async (año: number): Promise<Objetivo[]> => {
  try {
    const response = await api.get<BackendObjetivo[]>("/reportes/objetivos", {
      params: { año }
    });
    
    return response.data.map((objetivo) => ({
      idObjetivo: objetivo.idobjetivo,
      mes: objetivo.mes,
      año: objetivo.año,
      monto: parseFloat(objetivo.monto),
    }));
  } catch (error) {
    console.error("Error fetching objetivos:", error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
};

export const getObjetivo = async (mes: number, año: number): Promise<Objetivo | null> => {
  try {
    const response = await api.get<BackendObjetivo | null>("/reportes/objetivos/objetivo", {
      params: { mes, año }
    });
    
    // Si la respuesta es null o undefined, devolver null
    if (!response.data) {
      return null;
    }
    
    return {
      idObjetivo: response.data.idobjetivo,
      mes: response.data.mes,
      año: response.data.año,
      monto: parseFloat(response.data.monto),
    };
  } catch (error: any) {
    // Para cualquier error (404, 500, etc.), devolver null
    console.warn(`No se encontró objetivo para mes ${mes}, año ${año}:`, error.message);
    return null;
  }
};

export const createOrUpdateObjetivo = async (objetivo: ObjetivoRequest): Promise<Objetivo> => {
  try {
    const response = await api.post<BackendObjetivo>("/reportes/objetivos", objetivo);
    
    return {
      idObjetivo: response.data.idobjetivo,
      mes: response.data.mes,
      año: response.data.año,
      monto: parseFloat(response.data.monto),
    };
  } catch (error) {
    console.error("Error creating/updating objetivo:", error);
    throw new Error("No se pudo guardar el objetivo"); // Solo lanzar error aquí porque es una operación de escritura
  }
};

// Ventas Mensuales
export const getVentasMensuales = async (mes: number, año: number): Promise<VentaMensual> => {
  try {
    const response = await api.get<BackendVentaMensual>("/reportes/ventas-mensuales", {
      params: { mes, año }
    });
    
    return {
      mes: response.data.mes,
      año: response.data.año,
      totalVentas: response.data.total_ventas,
      totalIngresos: parseFloat(response.data.total_ingresos),
    };
  } catch (error: any) {
    // Para cualquier error, devolver valores por defecto
    console.warn(`No se encontraron ventas para mes ${mes}, año ${año}:`, error.message);
    return {
      mes: mes,
      año: año,
      totalVentas: 0,
      totalIngresos: 0
    };
  }
};