import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ShoppingCart, Plus, Minus, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Product, ProductVariant } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, selectedColor?: string) => void;
}

export function ProductDetailsModal({ product, isOpen, onClose, onAddToCart }: ProductDetailsModalProps) {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
      setIsZoomed(false);
      setQuantity(1);
      // Auto-select first variant if available
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const availableVariants = product.variants || [];
  const currentVariant = selectedVariant || product;
  const images = currentVariant.images && currentVariant.images.length > 0 ? currentVariant.images : product.images;

  // Función MEJORADA para formatear la descripción que funciona en producción
  const formatDescriptionForProduction = (description: string): string => {
    if (!description) return "Sin descripción";
    
    // Para producción: normalizar todos los tipos de saltos de línea
    const normalizedDescription = description
      .replace(/\r\n/g, '\n')  // Windows a Unix
      .replace(/\r/g, '\n')    // Mac antiguo a Unix
      .replace(/\n+/g, '\n')   // Múltiples saltos a uno solo
      .trim();
    
    console.log("DEBUG - Descripción recibida:", {
      original: description,
      normalizada: normalizedDescription,
      longitud: normalizedDescription.length,
      contieneSaltos: normalizedDescription.includes('\n')
    });
    
    return normalizedDescription;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setCurrentImageIndex(0); // Reset to first image when changing variant
  };

  const incrementQuantity = () => {
    const stock = currentVariant.stock || product.stock;
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!onAddToCart) return;
    
    // Si hay variantes disponibles, crear un producto específico para la variante seleccionada
    if (selectedVariant && availableVariants.length > 0) {
      // Crear un producto específico para esta variante
      const variantProduct: Product = {
        ...product,
        id: selectedVariant.id, // Usar el ID de la variante como identificador único
        name: `${product.name} - ${selectedVariant.name}`,
        price: selectedVariant.price,
        images: selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images : product.images,
        stock: selectedVariant.stock,
        size: selectedVariant.size,
        watt: selectedVariant.watt,
        colorDisenio: selectedVariant.colorDisenio,
        colorLuz: selectedVariant.colorLuz,
        color: selectedVariant.colorDisenio || selectedVariant.colorLuz,
        baseId: product.id, // Guardar el ID base del producto
        variants: undefined // No incluir variantes para evitar confusión
      };
      
      onAddToCart(variantProduct, quantity, selectedVariant.colorDisenio || selectedVariant.colorLuz);
      
      toast({
        title: "Agregado al carrito",
        description: `${variantProduct.name}`,
      });
    } else {
      // Si no hay variantes, agregar el producto base
      onAddToCart(product, quantity, product.colorDisenio || product.colorLuz);
      
      toast({
        title: "Agregado al carrito",
        description: `${product.name}`,
      });
    }
    
    onClose();
  };

  const getStockStatus = () => {
    const stock = currentVariant.stock || product.stock;
    if (stock === 0) {
      return { text: "Agotado", variant: "destructive" as const };
    } else {
      return { text: "Disponible", variant: "default" as const };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] md:w-full overflow-y-auto p-4 md:p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold text-primary">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Image Gallery */}
          <div className="space-y-2 md:space-y-4">
            {/* Main Image */}
            <div className="relative w-full bg-muted/30 rounded-lg overflow-hidden h-80 md:h-96 lg:aspect-square lg:h-auto">
              <img
                src={images[currentImageIndex] || '/placeholder-product.jpg'}
                alt={`${product.name} - imagen ${currentImageIndex + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-grab' : 'cursor-zoom-in'
                }`}
                onClick={toggleZoom}
                draggable={false}
              />
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-10 w-10 p-0 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-10 w-10 p-0 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Zoom button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleZoom}
                className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/70 h-10 w-10 p-0 rounded-full"
              >
                {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </Button>

              {/* Image indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentImageIndex ? 'bg-secondary' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Image Thumbnails - Hidden on mobile */}
            {images.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'border-primary ring-2 ring-primary/50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <img
                      src={image || '/placeholder-product.jpg'}
                      alt={`${product.name} - miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2">
                {product.name}
              </h3>
              <div className="text-muted-foreground text-sm md:text-lg leading-relaxed whitespace-pre-line">
                {formatDescriptionForProduction(product.description)}
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.text}
                    </Badge>
                  </div>
                  
                  {/* Mostrar tamaño solo si existe */}
                  {currentVariant.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamaño:</span>
                      <Badge variant="outline">{currentVariant.size}</Badge>
                    </div>
                  )}
                  
                  {/* Mostrar watts solo si existe */}
                  {currentVariant.watt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Watts:</span>
                      <Badge variant="outline">{currentVariant.watt}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  {/* Mostrar color de diseño solo si existe */}
                  {currentVariant.colorDisenio && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color de Diseño:</span>
                      <Badge variant="outline">{currentVariant.colorDisenio}</Badge>
                    </div>
                  )}
                  
                  {/* Mostrar color de luz solo si existe */}
                  {currentVariant.colorLuz && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color de Luz:</span>
                      <Badge variant="outline">{currentVariant.colorLuz}</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="text-xl md:text-2xl font-black text-primary">
                      Bs. {currentVariant.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Variants - Simplificado para mostrar solo el nombre */}
            {availableVariants.length > 1 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  ¡Elige tu variante favorita!
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableVariants.map((variant) => (
                    <Badge
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-300 px-3 py-2 ${
                        selectedVariant?.id === variant.id 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg' 
                          : 'bg-white hover:bg-purple-100 border-purple-300 hover:border-purple-500'
                      }`}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      <span className="font-bold">{variant.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {onAddToCart && (
              <div className="mt-4 md:mt-6 space-y-4">
                {/* Quantity Selector */}
                {(currentVariant.stock || product.stock) > 0 && (
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-sm font-medium text-muted-foreground">Cantidad:</span>
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={incrementQuantity}
                        disabled={quantity >= (currentVariant.stock || product.stock)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={(currentVariant.stock || product.stock) === 0}
                  className="w-full btn-neoled-secondary group text-sm h-10 md:h-12"
                >
                  <ShoppingCart className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  {(currentVariant.stock || product.stock) === 0 ? 'Agotado' : `Agregar ${quantity} al Carrito`}
                </Button>

                {/* Información importante sobre variantes */}
                {availableVariants.length > 1 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Se agregará la variante seleccionada: <strong>{selectedVariant?.name}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}