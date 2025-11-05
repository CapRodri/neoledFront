import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Product } from "./ProductCard";

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function ShoppingCart({ 
  items, 
  isOpen, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: ShoppingCartProps) {
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const item = items.find(item => item.id === productId);
    if (item) {
      const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + change));
      onUpdateQuantity(productId, newQuantity);
    }
  };

  // Handle back button on mobile to close cart
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePopstate = (event: PopStateEvent) => {
      onClose();
    };

    // Add a history entry when cart opens
    window.history.pushState({ cartOpen: true }, '');
    
    // Listen for back button
    window.addEventListener('popstate', handlePopstate);
    
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [isOpen, onClose]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <ShoppingBag className="h-6 w-6" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? "Tu carrito está vacío" 
              : `${getTotalItems()} ${getTotalItems() === 1 ? 'artículo' : 'artículos'} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">Tu carrito está vacío</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega algunos productos LED increíbles para comenzar
                </p>
              </div>
              <Button onClick={onClose} className="btn-neoled">
                Explorar Productos
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow space-y-2">
                           <div className="flex justify-between items-start">
                             <div>
                               <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                             </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-black text-primary">
                              Bs. {(item.price * item.quantity).toFixed(2)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-bold text-sm min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.stock && (
                            <p className="text-xs text-destructive">
                              Stock máximo disponible: {item.stock}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Subtotal:</span>
                      <span className="text-sm">Bs. {getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Envío:</span>
                      <span className="text-sm text-muted-foreground">A consultar</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black">Total:</span>
                      <span className="text-lg font-black text-primary">
                        Bs. {getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={onCheckout} 
                    className="w-full btn-neoled-secondary text-lg py-6"
                    size="lg"
                  >
                    Realizar Pedido
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    El pago se coordinará por WhatsApp
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}