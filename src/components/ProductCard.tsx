import { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  color?: string;
  size?: string;
  watt?: string;
  colorDisenio?: string;
  colorLuz?: string;
  type: string;
  stock: number;
  baseId?: string;
  variants?: ProductVariant[];
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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  
  // Obtener todas las variantes (producto base + variantes adicionales)
  const allDisplayVariants = [
    product,
    ...(product.variants || [])
  ];

  // Función para formatear la descripción manteniendo saltos de línea
  const formatDescription = (description: string): string => {
    if (!description) return "Sin descripción";
    
    // Normalizar saltos de línea para diferentes sistemas
    return description
      .replace(/\r\n/g, '\n')  // Windows a Unix
      .replace(/\r/g, '\n')    // Mac antiguo a Unix
      .replace(/\n+/g, '\n')   // Múltiples saltos a uno solo
      .trim();
  };

  // Intercalar entre variantes cada 5 segundos solo si hay más de una variante para mostrar
  useEffect(() => {
    if (allDisplayVariants.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVariantIndex((prev) => (prev === allDisplayVariants.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [allDisplayVariants.length]);

  // Obtener la variante actual
  const currentVariant = allDisplayVariants[currentVariantIndex];
  
  // Obtener imágenes de la variante actual
  const currentImages = currentVariant.images && currentVariant.images.length > 0 
    ? currentVariant.images 
    : (product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg']);

  // Manejar navegación manual de imágenes
  useEffect(() => {
    if (!isHovered || currentImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, currentImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const getStockStatus = () => {
    const stock = currentVariant.stock;
    if (stock === 0) {
      return { text: "Agotado", variant: "destructive" as const };
    } else {
      return { text: "Disponible", variant: "default" as const };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-card border-border/50 animate-fade-in-up flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="relative aspect-square bg-muted/30">
          {/* Image Carousel */}
          <img
            src={currentImages[currentImageIndex]}
            alt={`${currentVariant.name} - imagen ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Navigation arrows for multiple images - Mejorados para móvil */}
          {currentImages.length > 1 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 md:h-10 md:w-10 p-0 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 md:h-10 md:w-10 p-0 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-1 md:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                      index === currentImageIndex ? 'bg-secondary' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Overlay con efectos */}
          <div className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold">
                {product.category}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                className="bg-white/90 hover:bg-white text-primary border-none"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Stock badge */}
          <Badge className={`absolute top-2 right-2 ${
            currentVariant.stock === 0 ? 'bg-muted text-muted-foreground' : 'bg-green-500 text-white'
          }`}>
            {stockStatus.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {currentVariant.name}
          </CardTitle>
          <div className="text-xs md:text-sm text-muted-foreground line-clamp-2 hidden md:block whitespace-pre-line leading-relaxed">
            {formatDescription(product.description)}
          </div>
        </div>

        {/* Product Specifications */}
        <div className="space-y-1">
          {/* Mostrar tamaño solo si existe */}
          {currentVariant.size && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tamaño:</span>
              <span className="font-medium">{currentVariant.size}</span>
            </div>
          )}
          
          {/* Mostrar watts solo si existe */}
          {currentVariant.watt && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Watts:</span>
              <span className="font-medium">{currentVariant.watt}</span>
            </div>
          )}
          
          {/* Mostrar color de diseño solo si existe */}
          {currentVariant.colorDisenio && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Color Diseño:</span>
              <span className="font-medium">{currentVariant.colorDisenio}</span>
            </div>
          )}
          
          {/* Mostrar color de luz solo si existe */}
          {currentVariant.colorLuz && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Color Luz:</span>
              <span className="font-medium">{currentVariant.colorLuz}</span>
            </div>
          )}
        </div>

        {/* Available Variants Info - Contador corregido */}
        {product.variants && product.variants.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg border border-purple-200">
              <Palette className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-700">
                ¡{product.variants.length} opción{product.variants.length > 1 ? 'es' : ''} disponible{product.variants.length > 1 ? 's' : ''}!
              </span>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="pt-1">
          <div className="text-lg md:text-2xl font-black text-primary">
            Bs. {currentVariant.price.toFixed(2)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-2 mt-auto">
        {/* View Product Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="w-full btn-neoled-secondary group text-xs md:text-sm h-9 md:h-10 py-1 md:py-2"
        >
          <Eye className="h-4 w-4 mr-0 md:mr-2 transition-transform duration-300 group-hover:scale-110" />
          <span className="hidden md:inline">Ver Producto</span>
          <span className="md:hidden">Ver</span>
        </Button>
      </CardFooter>
    </Card>
  );
}