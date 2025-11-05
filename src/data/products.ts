import { Product } from "@/components/ProductCard";

// Estructura mejorada para productos con variantes de color
export interface ProductVariant {
  id: string;
  color: string;
  images: string[];
  stock: number;
  price?: number; // Precio específico del color si es diferente
}

export interface ProductGroup {
  baseId: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  size?: string;
  type: string;
  variants: ProductVariant[];
}

// Datos agrupados por producto con variantes
export const productGroups: ProductGroup[] = [
  
];

export const sampleProducts: Product[] = [
 
];

// Convertir productos agrupados a productos individuales para compatibilidad
export const getAllProducts = (): Product[] => {
  const products: Product[] = [];
  
  // Primero los productos agrupados con variantes
  productGroups.forEach(group => {
    group.variants.forEach(variant => {
      products.push({
        id: variant.id,
        name: group.name,
        description: group.description,
        price: variant.price || group.basePrice,
        images: [variant.images[0]],
        category: group.category,
        color: variant.color,
        size: group.size,
        type: group.type,
        stock: variant.stock,
        baseId: group.baseId,
        variants: group.variants
      });
    });
  });
  
  // Luego los productos simples existentes
  products.push(...sampleProducts);
  
  return products;
};

export const getUniqueValues = (products: Product[], field: keyof Product): string[] => {
  const values = products.map(product => product[field]).filter(Boolean) as string[];
  return Array.from(new Set(values)).sort();
};

export const allProducts = getAllProducts();
export const categories = getUniqueValues(allProducts, 'category');
export const colors = getUniqueValues(allProducts, 'color');
export const sizes = getUniqueValues(allProducts, 'size');
export const types = getUniqueValues(allProducts, 'type');