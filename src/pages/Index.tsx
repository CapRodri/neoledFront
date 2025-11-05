import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard, Product } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductFilters, FilterOptions } from "@/components/ProductFilters";
import { ShoppingCart, CartItem } from "@/components/ShoppingCart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ShoppingBag, Package, Truck, Phone, Star, Zap, Facebook, Instagram, MapPin } from "lucide-react";
import { 
  getProducts, 
  searchProducts, 
  getProductCategories, 
  getProductColors, 
  getProductSizes, 
  getProductTypes, 
  getCarruseles,
  Carrusel
} from "@/api/HomeApi";

// SVG del logo oficial de TikTok
const TiktokIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-3.77-1.105l-.001-.001z"/>
  </svg>
);

// SVG del logo oficial de WhatsApp
const WhatsappIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.464"/>
  </svg>
);

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    color: "all",
    size: "all",
    type: "all",
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  
  // Estados para datos de la base de datos
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [carruseles, setCarruseles] = useState<Carrusel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Ref para scroll a resultados
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [
          productsData,
          categoriesData,
          colorsData,
          sizesData,
          typesData,
          carruselesData
        ] = await Promise.all([
          getProducts(),
          getProductCategories(),
          getProductColors(),
          getProductSizes(),
          getProductTypes(),
          getCarruseles()
        ]);

        setAllProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setColors(colorsData);
        setSizes(sizesData);
        setTypes(typesData);
        setCarruseles(carruselesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Buscar productos cuando cambia el searchQuery
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        // Si no hay query, mostrar todos los productos
        try {
          const products = await getProducts();
          setAllProducts(products);
          setFilteredProducts(products);
        } catch (error) {
          console.error("Error loading products:", error);
        }
        return;
      }

      setSearchLoading(true);
      try {
        const searchResults = await searchProducts(searchQuery);
        setFilteredProducts(searchResults);
        
        // Scroll a resultados después de buscar
        setTimeout(() => {
          if (resultadosRef.current) {
            resultadosRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      } catch (error) {
        console.error("Error searching products:", error);
        toast({
          title: "Error",
          description: "No se pudieron buscar los productos",
          variant: "destructive",
        });
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, toast]);

  // Filtrar productos cuando cambian los filtros
  useEffect(() => {
    const applyFilters = async () => {
      if (!hasActiveFilters) {
        // Si no hay filtros activos, mostrar todos los productos
        try {
          const products = await getProducts();
          setAllProducts(products);
          setFilteredProducts(products);
        } catch (error) {
          console.error("Error loading products:", error);
        }
        return;
      }

      try {
        const filtered = await getProducts(filters);
        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error filtering products:", error);
        toast({
          title: "Error",
          description: "No se pudieron aplicar los filtros",
          variant: "destructive",
        });
      }
    };

    applyFilters();
  }, [filters, toast]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      filters.category !== "all" ||
      filters.color !== "all" ||
      filters.size !== "all" ||
      filters.type !== "all"
    );
  }, [searchQuery, filters]);

  const handleAddToCart = (product: Product, quantity: number, selectedColor?: string) => {
    // Crear un identificador único que incluya el color si está disponible
    const uniqueId = selectedColor ? `${product.id}-${selectedColor}` : product.id;
    const productWithColor = selectedColor ? 
      { ...product, id: uniqueId, color: selectedColor, name: `${product.name} - ${selectedColor}` } : 
      product;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === uniqueId);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        return prevItems.map(item =>
          item.id === uniqueId 
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevItems, { ...productWithColor, quantity }];
      }
    });

    toast({
      title: "Agregado al carrito",
      description: `${productWithColor.name}`,
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: "Producto eliminado",
      description: "El producto fue eliminado del carrito",
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    toast({
      title: "¡Pedido completado!",
      description: "Pronto nos contactaremos contigo por WhatsApp",
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
    // Agregar entrada al historial para manejar el botón "atrás"
    window.history.pushState({ modalOpen: true }, '');
  };

  const handleCloseProductDetails = () => {
    setIsProductDetailsOpen(false);
    setSelectedProduct(null);
  };

  // Manejar el botón "atrás" del navegador
  useEffect(() => {
    const handlePopState = () => {
      if (isProductDetailsOpen) {
        // Si el modal está abierto y el usuario presiona "atrás", cerrar el modal
        setIsProductDetailsOpen(false);
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isProductDetailsOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Products Section */}
      <section id="productos" className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
              Nuestros Productos LED
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra la iluminación perfecta para cada espacio con nuestra amplia gama de productos LED
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-8">
            <ProductFilters
              onFiltersChange={setFilters}
              categories={categories}
              colors={colors}
              sizes={sizes}
              types={types}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando productos...</p>
            </div>
          )}

          {/* Conditional Content */}
          {!loading && hasActiveFilters ? (
            /* Filtered Products View */
            <div ref={resultadosRef} className="space-y-6">
              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-sm md:text-lg px-3 py-1">
                    {filteredProducts.length} productos encontrados
                  </Badge>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs md:text-sm">
                      Buscando: "{searchQuery}"
                    </Badge>
                  )}
                  {searchLoading && (
                    <Badge variant="secondary" className="text-xs md:text-sm">
                      Buscando...
                    </Badge>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={`${product.id}-${product.color || 'default'}`}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8 md:py-12">
                  <CardContent>
                    <Lightbulb className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg md:text-xl font-bold text-muted-foreground mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Intenta ajustar los filtros o términos de búsqueda
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Product Carousels View - SOLO carruseles de la base de datos */
            <div className="space-y-8 md:space-y-12">
              {/* Carruseles desde la base de datos */}
              {!loading && carruseles.map((carrusel) => (
                carrusel.productos && carrusel.productos.length > 0 && (
                  <ProductCarousel
                    key={carrusel.id}
                    products={carrusel.productos}
                    title={carrusel.nombre}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                )
              ))}

              {/* Todos los productos debajo de los carruseles */}
              {!loading && filteredProducts.length > 0 && (
                <div className="mt-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-black text-primary mb-4">
                      Todos Nuestros Productos
                    </h3>
                    <p className="text-muted-foreground">
                      Descubre nuestra completa gama de productos LED
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={`${product.id}-${product.color || 'default'}`}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
              ¿Por Qué Elegir NEOLED?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              La mejor tecnología LED con beneficios únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <Card className="bg-background border hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-black text-primary mb-2">Máxima Eficiencia</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Ahorro energético hasta 80% comparado con iluminación tradicional
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-black text-primary mb-2">Calidad Premium</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Productos certificados con garantía extendida y soporte técnico
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-black text-primary mb-2">Instalación Rápida</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Fácil instalación con soporte técnico especializado incluido
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section - Optimizado para móvil */}
      <section id="contacto" className="py-8 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4">
                ¿Necesitas Ayuda?
              </h2>
              <p className="text-base md:text-xl opacity-90 px-2">
                Nuestro equipo está listo para ayudarte a encontrar la iluminación perfecta
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <Phone className="h-5 w-5 md:h-8 md:w-8 text-secondary-foreground" />
                    </div>
                    <h3 className="text-base md:text-xl font-black mb-2">Contacto Directo</h3>
                    <p className="mb-2 md:mb-3 opacity-80 text-xs md:text-sm">Habla directamente con nuestros especialistas</p>
                    <p className="text-secondary font-bold text-sm md:text-lg">+591 77950297</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mb-3 md:mb-4">
                      <ShoppingBag className="h-5 w-5 md:h-8 md:w-8 text-secondary-foreground" />
                    </div>
                    <h3 className="text-base md:text-xl font-black mb-2">Pedidos Personalizados</h3>
                    <p className="mb-2 md:mb-3 opacity-80 text-xs md:text-sm">Soluciones adaptadas a tus necesidades</p>
                    <p className="text-secondary font-bold text-xs md:text-sm">Consulta sin compromiso</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Icons Section */}
            <div className="mt-8 md:mt-12 text-center">
              <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 opacity-90">
                Síguenos en nuestras redes sociales
              </h3>
              <div className="flex justify-center gap-3 md:gap-4">
                <button 
                  onClick={() => window.open('https://www.facebook.com/share/1Ca91J72rm/', '_blank')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                >
                  <Facebook className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
                <button 
                  onClick={() => window.open('https://www.tiktok.com/@neoled_neoled', '_blank')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                >
                  <TiktokIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
                <button 
                  onClick={() => window.open('https://www.instagram.com/neoled_bolivia?igsh=cWV2aGtncG1xbGg4', '_blank')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                >
                  <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
                <button 
                  onClick={() => window.open('https://wa.me/59177950297', '_blank')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                >
                  <WhatsappIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
                <button 
                  onClick={() => window.open('https://maps.app.goo.gl/ZdrPRkLNuJz1eHQRA', '_blank')}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping Cart */}
      <ShoppingCart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isProductDetailsOpen}
        onClose={handleCloseProductDetails}
        onAddToCart={(product) => handleAddToCart(product, 1)}
      />

      {/* Floating Cart Button */}
      <FloatingCartButton
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Checkout Form */}
      {isCheckoutOpen && (
        <CheckoutForm
          items={cartItems}
          totalPrice={getTotalPrice()}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default Index;