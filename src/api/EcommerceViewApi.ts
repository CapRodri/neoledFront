// src/api/EcommerceViewApi.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendCarrusel {
  idcarrusel: number;
  nombre: string;
  estado: number;
}

interface BackendCarruselVariante {
  idcarrusel_variante: number;
  idcarrusel: number;
  idproducto: number;
}

interface BackendProducto {
  idproducto: number;
  nombre: string;
  descripcion: string;
  idubicacion: number;
  estado: number;
}

interface BackendVariante {
  idvariante: number;
  idproducto: number;
  nombre_variante: string;
  precio_venta: string;
  precio_compra: string;
  idcolor_disenio: number;
  idcolor_luz: number;
  idwatt: number;
  idtamano: number;
  stock: number;
  stock_minimo: number;
  estado: number;
}

interface BackendImagen {
  idimagen: number;
  idvariante: number;
  imagen: string;
}

export interface Carrusel {
  id: string;
  name: string;
  productIds: string[];
  estado: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  variants?: Variant[];
}

export interface Variant {
  id: string;
  color: string;
  stock: number;
  price: number;
}

export interface CarruselRequest {
  nombre: string;
  productIds: number[];
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función auxiliar para eliminar variantes de carrusel
const deleteCarruselVariantes = async (id: string): Promise<void> => {
  try {
    // Intentamos usar el endpoint DELETE si existe
    await api.delete(`/ecommerce/carruseles/${id}/variantes`);
  } catch (error) {
    // Si el endpoint no existe, no hacemos nada
    console.log("Endpoint DELETE para variantes no disponible, continuando...");
  }
};

// Mapear carrusel del backend al frontend
const mapBackendCarrusel = async (backendCarrusel: BackendCarrusel): Promise<Carrusel> => {
  try {
    // Obtener las variantes del carrusel
    const variantesResponse = await api.get<BackendCarruselVariante[]>(
      `/ecommerce/carruseles/${backendCarrusel.idcarrusel}/variantes`
    );
    
    const productIds = variantesResponse.data.map(variante => variante.idproducto.toString());
    
    return {
      id: backendCarrusel.idcarrusel.toString(),
      name: backendCarrusel.nombre,
      productIds: productIds,
      estado: backendCarrusel.estado
    };
  } catch (error) {
    console.error("Error mapping carrusel:", error);
    return {
      id: backendCarrusel.idcarrusel.toString(),
      name: backendCarrusel.nombre,
      productIds: [],
      estado: backendCarrusel.estado
    };
  }
};

// Mapear producto del backend al frontend
const mapBackendProduct = async (backendProducto: BackendProducto): Promise<Product> => {
  try {
    // Obtener categorías del producto
    const categoriasResponse = await api.get<string[]>(
      `/ecommerce/productos/${backendProducto.idproducto}/categorias`
    );
    
    // Obtener tipos del producto
    const tiposResponse = await api.get<string[]>(
      `/ecommerce/productos/${backendProducto.idproducto}/tipos`
    );
    
    // Obtener variantes del producto
    const variantesResponse = await api.get<BackendVariante[]>(
      `/ecommerce/productos/${backendProducto.idproducto}/variantes`
    );
    
    // Obtener imágenes de la primera variante (si existe)
    let images: string[] = [];
    if (variantesResponse.data.length > 0) {
      const primeraVariante = variantesResponse.data[0];
      const imagenesResponse = await api.get<BackendImagen[]>(
        `/ecommerce/variantes/${primeraVariante.idvariante}/imagenes`
      );
      images = imagenesResponse.data.map(img => `data:image/jpeg;base64,${img.imagen}`);
    }
    
    // Mapear variantes
    const variants: Variant[] = await Promise.all(
      variantesResponse.data.map(async (variante) => {
        try {
          // Obtener color de diseño
          const colorResponse = await api.get<{ nombre: string }>(
            `/ecommerce/colores-disenio/${variante.idcolor_disenio}`
          );
          
          return {
            id: variante.idvariante.toString(),
            color: colorResponse.data.nombre,
            stock: variante.stock,
            price: parseFloat(variante.precio_venta)
          };
        } catch (error) {
          console.error(`Error mapping variant ${variante.idvariante}:`, error);
          return {
            id: variante.idvariante.toString(),
            color: "Color no disponible",
            stock: variante.stock,
            price: parseFloat(variante.precio_venta)
          };
        }
      })
    );
    
    const categoria = categoriasResponse.data.length > 0 ? categoriasResponse.data[0] : "Sin categoría";
    const tipo = tiposResponse.data.length > 0 ? tiposResponse.data[0] : "Sin tipo";
    const color = variants.length > 0 ? variants[0].color : "Sin color";
    const price = variants.length > 0 ? variants[0].price : 0;
    const stock = variants.reduce((total, variant) => total + variant.stock, 0);
    
    return {
      id: backendProducto.idproducto.toString(),
      name: backendProducto.nombre,
      description: backendProducto.descripcion || "",
      category: categoria,
      type: tipo,
      color: color,
      price: price,
      stock: stock,
      images: images,
      variants: variants.length > 0 ? variants : undefined
    };
  } catch (error) {
    console.error("Error mapping product:", error);
    return {
      id: backendProducto.idproducto.toString(),
      name: backendProducto.nombre,
      description: backendProducto.descripcion || "",
      category: "Sin categoría",
      type: "Sin tipo",
      color: "Sin color",
      price: 0,
      stock: 0,
      images: [],
      variants: []
    };
  }
};

// Obtener todos los carruseles
export const getCarruseles = async (): Promise<Carrusel[]> => {
  try {
    const response = await api.get<BackendCarrusel[]>("/ecommerce/carruseles");
    const carruseles = await Promise.all(
      response.data
        .filter(carrusel => carrusel.estado === 0) // Solo carruseles activos
        .map(mapBackendCarrusel)
    );
    return carruseles;
  } catch (error) {
    console.error("Error fetching carruseles:", error);
    throw new Error("No se pudieron cargar los carruseles");
  }
};

// Obtener todos los productos disponibles
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<BackendProducto[]>("/ecommerce/productos");
    const productos = await Promise.all(
      response.data
        .filter(producto => producto.estado === 0) // Solo productos activos
        .map(mapBackendProduct)
    );
    return productos;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("No se pudieron cargar los productos");
  }
};

// Buscar productos en el backend
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const response = await api.get<BackendProducto[]>(`/ecommerce/productos/search?q=${encodeURIComponent(searchTerm)}`);
    const productos = await Promise.all(
      response.data
        .filter(producto => producto.estado === 0) // Solo productos activos
        .map(mapBackendProduct)
    );
    return productos;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("No se pudieron buscar los productos");
  }
};

// Crear nuevo carrusel
export const createCarrusel = async (carrusel: CarruselRequest): Promise<Carrusel> => {
  try {
    // Crear el carrusel
    const response = await api.post<BackendCarrusel>("/ecommerce/carruseles", {
      nombre: carrusel.nombre
    });
    
    // Agregar productos al carrusel si hay productos seleccionados
    if (carrusel.productIds && carrusel.productIds.length > 0) {
      try {
        await api.post(`/ecommerce/carruseles/${response.data.idcarrusel}/variantes`, {
          productos: carrusel.productIds
        });
      } catch (variantesError) {
        console.error("Error adding products to carousel:", variantesError);
        // No lanzamos error aquí para que al menos se cree el carrusel
      }
    }
    
    return await mapBackendCarrusel(response.data);
  } catch (error: any) {
    console.error("Error creating carrusel:", error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Datos inválidos para crear el carrusel");
    }
    
    throw new Error("No se pudo crear el carrusel");
  }
};

// Actualizar carrusel
export const updateCarrusel = async (id: string, carrusel: CarruselRequest): Promise<Carrusel> => {
  try {
    // Actualizar el carrusel
    const response = await api.put<BackendCarrusel>(`/ecommerce/carruseles/${id}`, {
      nombre: carrusel.nombre
    });
    
    // Actualizar productos del carrusel
    if (carrusel.productIds && carrusel.productIds.length >= 0) {
      try {
        await api.put(`/ecommerce/carruseles/${id}/variantes`, {
          productos: carrusel.productIds
        });
      } catch (variantesError: any) {
        console.error("Error updating products in carousel:", variantesError);
        
        // Si el error es 500, intentamos una solución alternativa
        if (variantesError.response?.status === 500) {
          // Primero eliminamos todas las variantes
          await deleteCarruselVariantes(id);
          
          // Luego agregamos las nuevas si hay productos
          if (carrusel.productIds.length > 0) {
            await api.post(`/ecommerce/carruseles/${id}/variantes`, {
              productos: carrusel.productIds
            });
          }
        } else {
          throw new Error("Se actualizó el carrusel pero hubo un error al actualizar los productos");
        }
      }
    }
    
    return await mapBackendCarrusel(response.data);
  } catch (error: any) {
    console.error("Error updating carrusel:", error);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || "Datos inválidos para actualizar el carrusel");
    }
    
    if (error.response?.status === 404) {
      throw new Error("Carrusel no encontrado");
    }
    
    throw new Error("No se pudo actualizar el carrusel");
  }
};

// Eliminar carrusel (cambiar estado a 2)
export const deleteCarrusel = async (id: string): Promise<void> => {
  try {
    await api.delete(`/ecommerce/carruseles/${id}`);
  } catch (error: any) {
    console.error("Error deleting carrusel:", error);
    
    if (error.response?.status === 404) {
      throw new Error("Carrusel no encontrado");
    }
    
    throw new Error("No se pudo eliminar el carrusel");
  }
};