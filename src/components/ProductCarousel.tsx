import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: Product[];
  title: string;
  variant?: "default" | "offers";
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCarousel({ products, title, variant = "default", onAddToCart, onViewDetails }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 }
    }
  });
  
const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    const onDown = () => setIsPaused(true);
    const onUp = () => setIsPaused(false);
    emblaApi.on("pointerDown", onDown);
    emblaApi.on("pointerUp", onUp);

    const interval = setInterval(() => {
      if (!emblaApi || isPaused) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 8000);

    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onDown);
      emblaApi.off("pointerUp", onUp);
      clearInterval(interval);
    };
  }, [emblaApi, onSelect, isPaused]);

  if (products.length === 0) return null;

return (
    <div className="space-y-4">
      <div className={cn(
        "flex items-center",
        variant === "offers" && "bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-3"
      )}
      >
        <h3 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
          {title}
          {variant === "offers" && (
            <span className="hidden md:inline-block text-[10px] md:text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full px-3 py-1 shadow pulse">
              Ofertas
            </span>
          )}
        </h3>
      </div>

      <div className="relative flex items-center group">
        {/* Botón izquierdo - oculto en móvil */}
        <Button
          variant="outline"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-l-xl rounded-r-none",
            "bg-background/80 backdrop-blur-sm border-r-0",
            "transition-all duration-300 shadow-lg hover:shadow-xl",
            "hover:bg-primary hover:text-primary-foreground hover:scale-105",
            "disabled:opacity-0 disabled:cursor-not-allowed",
            // Móvil: oculto
            "hidden md:block",
            // Desktop: botones grandes
            "md:h-full md:w-12 md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div
          className={cn(
            "overflow-hidden",
            // Móvil: sin márgenes
            "mx-0",
            // Desktop: con márgenes para los botones
            "md:mx-12"
          )}
          ref={emblaRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[calc(50%-8px)] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botón derecho - oculto en móvil */}
        <Button
          variant="outline"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-r-xl rounded-l-none",
            "bg-background/80 backdrop-blur-sm border-l-0",
            "transition-all duration-300 shadow-lg hover:shadow-xl",
            "hover:bg-primary hover:text-primary-foreground hover:scale-105",
            "disabled:opacity-0 disabled:cursor-not-allowed",
            // Móvil: oculto
            "hidden md:block",
            // Desktop: botones grandes
            "md:h-full md:w-12 md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}