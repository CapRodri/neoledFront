import { useState, useEffect } from "react";
import { MapPin, Phone, User, Send, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "./ShoppingCart";

interface CheckoutFormProps {
  items: CartItem[];
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
  notes: string;
}

export function CheckoutForm({ items, totalPrice, onClose, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    deliveryType: "pickup",
    address: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle back button on mobile to close checkout
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      event.preventDefault();
      onClose();
    };

    // Add a history entry when checkout opens  
    window.history.pushState({ checkoutOpen: true }, '', window.location.href);
    
    // Listen for back button
    window.addEventListener('popstate', handlePopstate);
    
    return () => {
      window.removeEventListener('popstate', handlePopstate);
      // Remove the history entry when component unmounts
      if (window.history.state?.checkoutOpen) {
        window.history.back();
      }
    };
  }, [onClose]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de teléfono",
        variant: "destructive"
      });
      return false;
    }

    if (formData.deliveryType === "delivery" && !formData.address.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu dirección para el envío",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const generateWhatsAppMessage = () => {
    const itemsList = items.map(item => 
      `• ${item.name} - Cantidad: ${item.quantity} - Precio: Bs. ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const deliveryInfo = formData.deliveryType === "delivery" 
      ? `🚚 *Envío a domicilio*\n📍 Dirección: ${formData.address}`
      : `🏪 *Recoger en tienda*`;

    const message = `🛒 *NUEVO PEDIDO NEOLED*\n\n` +
      `👤 *Cliente:* ${formData.name}\n` +
      `📱 *Teléfono:* ${formData.phone}\n\n` +
      `📦 *Productos solicitados:*\n${itemsList}\n\n` +
      `💰 *Total:* Bs. ${totalPrice.toFixed(2)}\n\n` +
      `${deliveryInfo}\n\n` +
      `${formData.notes ? `📝 *Notas adicionales:*\n${formData.notes}\n\n` : ''}` +
      `*¡Gracias por elegir NEOLED! 💡*`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const whatsappMessage = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/59177950297?text=${whatsappMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      toast({
        title: "¡Pedido enviado!",
        description: "Te hemos redirigido a WhatsApp para confirmar tu pedido",
        variant: "default"
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Send className="h-6 w-6" />
            Finalizar Pedido
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-bold">Bs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">Bs. {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Información Personal</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Número de Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Ej: 75907104"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Delivery Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Opciones de Entrega</h3>
              
              <RadioGroup
                value={formData.deliveryType}
                onValueChange={(value: "delivery" | "pickup") => handleInputChange("deliveryType", value)}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">Recoger en Tienda</div>
                      <div className="text-sm text-muted-foreground">Sin costo adicional</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">Envío a Domicilio</div>
                      <div className="text-sm text-muted-foreground">Costo a coordinar</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {formData.deliveryType === "delivery" && (
                <div className="space-y-2 animate-fade-in-up">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección de Entrega *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Ingresa tu dirección completa con referencias..."
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-neoled-secondary"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar a WhatsApp
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Al enviar este pedido, serás redirigido a WhatsApp para coordinar el pago y la entrega
          </div>
        </CardContent>
      </Card>
    </div>
  );
}