import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloatingCartButtonProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function FloatingCartButton({ cartItemsCount, onCartClick }: FloatingCartButtonProps) {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={onCartClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 p-0 ${
        cartItemsCount > 0 ? 'animate-bounce shadow-primary/50' : ''
      }`}
    >
      <ShoppingCart className="h-6 w-6" />
      {cartItemsCount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground min-w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full animate-pulse">
          {cartItemsCount > 99 ? '99+' : cartItemsCount}
        </Badge>
      )}
    </Button>
  );
}