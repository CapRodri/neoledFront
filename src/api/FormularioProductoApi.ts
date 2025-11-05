// api/FormularioProductoApi.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Interfaces para productos y variantes
export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  idubicacion: number;
  categorias: number[];
  tipos: number[];
  variantes: VarianteRequest[];
}

export interface VarianteRequest {
  idvariante?: number;
  nombre_variante: string;
  precio_venta: number;
  precio_compra: number;
  idcolor_disenio: number | null;
  idcolor_luz: number | null;
  idwatt: number | null;
  idtamano: number | null;
  stock: number;
  stock_minimo: number;
  imagenes?: File[];
  imagenes_existentes?: string[];
}

export interface ProductoResponse {
  idproducto: number;
  nombre: string;
  descripcion: string;
  idubicacion: number;
  ubicacion: string;
  estado: number;
  categorias: string[];
  tipos: string[];
  variantes: VarianteResponse[];
}

export interface VarianteResponse {
  idvariante: number;
  idproducto: number;
  nombre_variante: string;
  precio_venta: number;
  precio_compra: number;
  idcolor_disenio: number | null;
  idcolor_luz: number | null;
  idwatt: number | null;
  idtamano: number | null;
  stock: number;
  stock_minimo: number;
  estado: number;
  color_disenio: string | null;
  color_luz: string | null;
  watt: string | null;
  tamano: string | null;
  imagenes: string[];
}

// Configuración de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Función helper para debug de FormData
const debugFormData = (formData: FormData) => {
  console.log("=== DEBUG FORM DATA ===");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
    } else if (key === 'variantes') {
      try {
        const parsed = JSON.parse(value as string);
        console.log(`${key}:`, JSON.stringify(parsed, null, 2));
      } catch {
        console.log(`${key}:`, value);
      }
    } else if (key === 'categorias' || key === 'tipos') {
      try {
        const parsed = JSON.parse(value as string);
        console.log(`${key}:`, parsed);
      } catch {
        console.log(`${key}:`, value);
      }
    } else {
      console.log(`${key}:`, value);
    }
  }
  console.log("=== FIN DEBUG FORM DATA ===");
};

// API para productos
export const createProducto = async (formData: FormData): Promise<ProductoResponse> => {
  try {
    console.log("Enviando datos al servidor...");
    
    // Debug mejorado
    debugFormData(formData);

    const response = await api.post<ProductoResponse>("/formulario-productos/productos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 segundos timeout
    });
    
    console.log("Producto creado exitosamente:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating producto:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error details:", error.response?.config?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        "No se pudo crear el producto";
    
    throw new Error(errorMessage);
  }
};

export const updateProducto = async (id: number, formData: FormData): Promise<ProductoResponse> => {
  try {
    console.log("Actualizando producto ID:", id);
    
    debugFormData(formData);

    const response = await api.put<ProductoResponse>(`/formulario-productos/productos/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
    
    console.log("Producto actualizado exitosamente:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating producto:", error);
    console.error("Error response:", error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        "No se pudo actualizar el producto";
    
    throw new Error(errorMessage);
  }
};

export const getProductoById = async (id: number): Promise<ProductoResponse> => {
  try {
    const response = await api.get<ProductoResponse>(`/formulario-productos/productos/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching producto:", error);
    throw new Error(error.response?.data?.message || "No se pudo cargar el producto");
  }
};

export const deleteProducto = async (id: number): Promise<void> => {
  try {
    await api.patch(`/formulario-productos/productos/${id}/eliminar`);
  } catch (error: any) {
    console.error("Error deleting producto:", error);
    throw new Error(error.response?.data?.message || "No se pudo eliminar el producto");
  }
};