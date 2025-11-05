import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getLowStockAlerts, Alert } from "@/api/AlertsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

// Componente para el carrusel de imágenes (similar al de ProductosView)
interface ImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
}

function ImageCarousel({ images, productName, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <Package className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  // Navegación automática cada 3 segundos
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      {/* Imagen principal */}
      <div className="relative aspect-square w-full">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop';
          }}
        />
        
        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {images.length > 1 && (
        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export function AlertasView() {
  const [productosStockBajo, setProductosStockBajo] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const alerts = await getLowStockAlerts();
        setProductosStockBajo(alerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las alertas");
        console.error("Error loading alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Alertas de Stock Mínimo</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Alertas de Stock Mínimo</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular el total de variantes con stock bajo
  const totalVariantesStockBajo = productosStockBajo.reduce((total, producto) => {
    return total + producto.variantes.length;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Alertas de Stock Mínimo</h1>
        <Badge variant="outline" className="text-lg">
          {totalVariantesStockBajo} variantes con stock bajo
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos con Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="block md:overflow-x-auto">
            {productosStockBajo.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay productos con stock bajo en este momento.
              </div>
            ) : (
              <Table>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead className="w-24">Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Watts</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Color Diseño</TableHead>
                    <TableHead>Color Luz</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosStockBajo.flatMap((producto) =>
                    producto.variantes.map((variante) => (
                      <TableRow key={`${producto.id}-${variante.idvariante}`} className="md:table-row block border-b p-4 md:p-0">
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-4 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-2">IMAGEN</div>
                          <div className="w-20 h-20 md:w-20 md:h-20 mx-auto md:mx-0">
                            <ImageCarousel
                              images={variante.imagenes}
                              productName={producto.producto}
                              className="w-20 h-20 md:w-20 md:h-20"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0 font-medium">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">PRODUCTO</div>
                          <div className="text-center md:text-left font-bold text-primary text-base">{producto.producto}</div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">WATTS</div>
                          <div className="text-center md:text-left">
                            <Badge variant="secondary" className="text-sm px-2 py-1">
                              {variante.watts}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">UBICACIÓN</div>
                          <div className="text-center md:text-left text-base">{producto.ubicacion}</div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">COLOR DISEÑO</div>
                          <div className="flex justify-center md:justify-start">
                            <Badge variant="outline" className="text-sm px-2 py-1">
                              {variante.colorDiseno}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">COLOR LUZ</div>
                          <div className="flex justify-center md:justify-start">
                            <Badge variant="outline" className="text-sm px-2 py-1">
                              {variante.colorLuz}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">STOCK ACTUAL</div>
                          <div className="flex justify-center md:justify-start">
                            <Badge variant="destructive" className="text-sm px-3 py-1 font-bold">
                              {variante.cantidad}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">STOCK MÍNIMO</div>
                          <div className="flex justify-center md:justify-start">
                            <Badge variant="outline" className="text-sm px-3 py-1">
                              {variante.stockMinimo}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}