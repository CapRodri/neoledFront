import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendAlert {
  idproducto: number;
  nombre: string;
  descripcion: string | null;
  idubicacion: number;
  nombre_ubicacion: string;
  variantes: BackendVariant[];
}

interface BackendVariant {
  idvariante: number;
  nombre_variante: string;
  precio_venta: string;
  precio_compra: string;
  color_disenio: string;
  color_luz: string;
  watt: string;
  tamano: string;
  stock: number;
  stock_minimo: number;
  estado: number;
  imagenes: string[];
}

export interface Alert {
  id: number;
  producto: string;
  ubicacion: string;
  variantes: Variant[];
}

export interface Variant {
  idvariante: number;
  colorDiseno: string;
  colorLuz: string;
  watts: string;
  cantidad: number;
  stockMinimo: number;
  imagenes: string[];
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Imágenes por defecto para cuando no hay imagen en la base de datos
const defaultImages = {
  "Tira LED 5050": "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop",
  "Foco LED 12W": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop",
  "Controlador RGB": "https://images.unsplash.com/photo-1535268647677-300dbf3078d1?w=100&h=100&fit=crop",
  "Reflector LED 50W": "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=100&h=100&fit=crop"
};

const getDefaultImage = (productName: string): string => {
  // Buscar una imagen por defecto basada en palabras clave del nombre del producto
  if (productName.toLowerCase().includes('tira') || productName.toLowerCase().includes('led')) {
    return defaultImages["Tira LED 5050"];
  } else if (productName.toLowerCase().includes('foco')) {
    return defaultImages["Foco LED 12W"];
  } else if (productName.toLowerCase().includes('controlador')) {
    return defaultImages["Controlador RGB"];
  } else if (productName.toLowerCase().includes('reflector')) {
    return defaultImages["Reflector LED 50W"];
  }
  return defaultImages["Tira LED 5050"];
};

export const getLowStockAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await api.get<BackendAlert[]>("/alerts/low-stock");
    
    return response.data.map(producto => ({
      id: producto.idproducto,
      producto: producto.nombre,
      ubicacion: producto.nombre_ubicacion,
      variantes: producto.variantes.map(variante => {
        // Si no hay imágenes, usar imagen por defecto
        let imagenes = variante.imagenes && variante.imagenes.length > 0 
          ? variante.imagenes 
          : [getDefaultImage(producto.nombre)];
        
        return {
          idvariante: variante.idvariante,
          colorDiseno: variante.color_disenio,
          colorLuz: variante.color_luz,
          watts: variante.watt,
          cantidad: variante.stock,
          stockMinimo: variante.stock_minimo,
          imagenes: imagenes
        };
      })
    }));
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    throw new Error("No se pudieron cargar las alertas de stock bajo");
  }
};

export const getCriticalStockAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await api.get<BackendAlert[]>("/alerts/critical-stock");
    
    return response.data.map(producto => ({
      id: producto.idproducto,
      producto: producto.nombre,
      ubicacion: producto.nombre_ubicacion,
      variantes: producto.variantes.map(variante => {
        // Si no hay imágenes, usar imagen por defecto
        let imagenes = variante.imagenes && variante.imagenes.length > 0 
          ? variante.imagenes 
          : [getDefaultImage(producto.nombre)];
        
        return {
          idvariante: variante.idvariante,
          colorDiseno: variante.color_disenio,
          colorLuz: variante.color_luz,
          watts: variante.watt,
          cantidad: variante.stock,
          stockMinimo: variante.stock_minimo,
          imagenes: imagenes
        };
      })
    }));
  } catch (error) {
    console.error("Error fetching critical stock alerts:", error);
    throw new Error("No se pudieron cargar las alertas de stock crítico");
  }
};