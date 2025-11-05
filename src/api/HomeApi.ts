import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendProduct {
  idproducto: number;
  nombre: string;
  descripcion: string;
  estado: number;
  categorias: string[];
  tipos: string[];
  variantes: BackendVariant[];
}

interface BackendVariant {
  idvariante: number;
  nombre_variante: string;
  precio_venta: string;
  precio_compra: string;
  stock: number;
  stock_minimo: number;
  estado: number;
  color_disenio?: string;
  color_luz?: string;
  watt?: string;
  tamano?: string;
  imagenes: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  color?: string;
  size?: string;
  type: string;
  stock: number;
  baseId?: string;
  variants?: ProductVariant[];
  watt?: string;
  colorDisenio?: string;
  colorLuz?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  colorDisenio?: string;
  colorLuz?: string;
  size?: string;
  watt?: string;
  stock: number;
  images: string[];
}

export interface FilterOptions {
  category: string;
  color: string;
  size: string;
  type: string;
}

export interface Carrusel {
  id: number;
  nombre: string;
  estado: number;
  productos: Product[];
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
);

export const getProducts = async (filters?: FilterOptions): Promise<Product[]> => {
  try {
    const params: any = {};
    if (filters) {
      if (filters.category !== "all") params.categoria = filters.category;
      if (filters.color !== "all") params.color = filters.color;
      if (filters.size !== "all") params.tamano = filters.size;
      if (filters.type !== "all") params.tipo = filters.type;
    }

    console.log("Fetching products with params:", params);
    const response = await api.get<BackendProduct[]>("/home/products", { params });
    console.log("Products response:", response.data);
    return response.data.map(mapBackendProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("No se pudieron cargar los productos");
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    console.log("Searching products with query:", query);
    const response = await api.get<BackendProduct[]>(`/home/products/search?q=${encodeURIComponent(query)}`);
    console.log("Search response:", response.data);
    return response.data.map(mapBackendProduct);
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("No se pudieron buscar los productos");
  }
};

export const getProductCategories = async (): Promise<string[]> => {
  try {
    console.log("Fetching categories");
    const response = await api.get<string[]>("/home/products/categories");
    console.log("Categories response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("No se pudieron cargar las categorías");
  }
};

export const getProductColors = async (): Promise<string[]> => {
  try {
    console.log("Fetching colors");
    const response = await api.get<string[]>("/home/products/colors");
    console.log("Colors response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching colors:", error);
    throw new Error("No se pudieron cargar los colores");
  }
};

export const getProductSizes = async (): Promise<string[]> => {
  try {
    console.log("Fetching sizes");
    const response = await api.get<string[]>("/home/products/sizes");
    console.log("Sizes response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching sizes:", error);
    throw new Error("No se pudieron cargar los tamaños");
  }
};

export const getProductTypes = async (): Promise<string[]> => {
  try {
    console.log("Fetching types");
    const response = await api.get<string[]>("/home/products/types");
    console.log("Types response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw new Error("No se pudieron cargar los tipos");
  }
};

export const getCarruseles = async (): Promise<Carrusel[]> => {
  try {
    console.log("Fetching carruseles");
    const response = await api.get<Carrusel[]>("/home/carruseles");
    console.log("Carruseles response:", response.data);
    
    // Mapear los productos dentro de los carruseles
    const carruselesWithMappedProducts = response.data.map(carrusel => ({
      ...carrusel,
      productos: carrusel.productos ? (carrusel.productos as unknown as BackendProduct[]).map(mapBackendProduct) : []
    }));
    
    return carruselesWithMappedProducts;
  } catch (error) {
    console.error("Error fetching carruseles:", error);
    return [];
  }
};

function mapBackendProduct(product: BackendProduct): Product {
  console.log("Mapping backend product:", product);
  
  // Validar que el producto tenga variantes
  if (!product.variantes || product.variantes.length === 0) {
    console.warn("Product has no variants:", product.idproducto);
    // Crear una variante por defecto
    const defaultVariant = {
      idvariante: product.idproducto,
      nombre_variante: product.nombre,
      precio_venta: "0",
      precio_compra: "0",
      stock: 0,
      stock_minimo: 0,
      estado: 0,
      imagenes: []
    };
    product.variantes = [defaultVariant];
  }

  const primaryVariant = product.variantes[0];
  
  // Validar que la variante primaria existe
  if (!primaryVariant) {
    console.error("No primary variant found for product:", product.idproducto);
    throw new Error(`No primary variant found for product ${product.idproducto}`);
  }

  const primaryCategory = product.categorias && product.categorias.length > 0 ? product.categorias[0] : "Sin categoría";
  const primaryType = product.tipos && product.tipos.length > 0 ? product.tipos[0] : "Sin tipo";

  // Mapear variantes con los campos correctos
  const variants: ProductVariant[] = product.variantes.map(variant => {
    const images = variant.imagenes && variant.imagenes.length > 0 
      ? variant.imagenes 
      : ['/placeholder-product.jpg'];
    
    // Convertir imágenes base64 a URLs si es necesario
    const processedImages = images.map(img => {
      if (img.startsWith('data:image')) {
        return img;
      }
      if (img.startsWith('/9j/') || img.length > 1000) {
        // Probablemente es base64
        return `data:image/jpeg;base64,${img}`;
      }
      return img;
    });

    return {
      id: variant.idvariante.toString(),
      name: variant.nombre_variante || product.nombre,
      price: parseFloat(variant.precio_venta) || 0,
      colorDisenio: variant.color_disenio,
      colorLuz: variant.color_luz,
      size: variant.tamano,
      watt: variant.watt,
      stock: variant.stock || 0,
      images: processedImages
    };
  });

  const primaryImages = primaryVariant.imagenes && primaryVariant.imagenes.length > 0 
    ? primaryVariant.imagenes.map(img => {
        if (img.startsWith('data:image')) return img;
        if (img.startsWith('/9j/') || img.length > 1000) {
          return `data:image/jpeg;base64,${img}`;
        }
        return img;
      })
    : ['/placeholder-product.jpg'];

  return {
    id: product.idproducto.toString(),
    name: product.nombre || "Producto sin nombre",
    description: product.descripcion || "Sin descripción",
    price: parseFloat(primaryVariant.precio_venta) || 0,
    images: primaryImages,
    category: primaryCategory,
    color: primaryVariant.color_disenio || primaryVariant.color_luz,
    size: primaryVariant.tamano,
    watt: primaryVariant.watt,
    colorDisenio: primaryVariant.color_disenio,
    colorLuz: primaryVariant.color_luz,
    type: primaryType,
    stock: primaryVariant.stock || 0,
    baseId: product.idproducto.toString(),
    variants: variants.length > 0 ? variants : undefined
  };
}