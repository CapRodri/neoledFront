import { Lightbulb, Facebook, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary/20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-secondary rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center space-y-6 animate-fade-in-up">
          {/* NEOLED Brand Title */}
          <div className="mb-4">
            <img 
              src="/lovable-uploads/84af3e7f-9171-4c73-900f-9499a96732341.png" 
              alt="NEOLED Logo" 
              className="w-65 h-auto mx-auto"
            />
          </div>

          {/* Hero Title */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight">
              INNOVANDO EL
              <span className="block text-secondary glow-effect">
                CONCEPTO DE LUZ
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto font-bold">
              Descubre la mejor tecnología LED para iluminar tu mundo con eficiencia, estilo y durabilidad
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6">
            <Button 
              onClick={scrollToProducts}
              size="lg" 
              className="text-lg px-6 sm:px-8 py-4 w-full sm:w-auto flex items-center justify-center group"
            >
              <Lightbulb className="mr-2 h-6 w-6 group-hover:animate-pulse" />
              Explorar Productos
            </Button>
            
            {/* Botón de WhatsApp Mejorado */}
            <Button
              size="lg"
              className="text-lg px-6 sm:px-8 py-4 w-full sm:w-auto bg-green-600 hover:bg-green-700 border-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 group relative overflow-hidden flex items-center justify-center"
              onClick={() => window.open('https://wa.me/59177950297', '_blank')}
            >
              {/* Efecto de fondo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icono y texto */}
              <div className="flex items-center relative z-10">
                <WhatsappIcon className="mr-2 h-6 w-6 group-hover:animate-bounce" />
                <span>Contactar por WhatsApp</span>
              </div>
            </Button>
          </div>

          {/* Social Media Icons Section - Más arriba y más grandes */}
          <div className="pt-6">
            <p className="text-primary-foreground/80 text-base mb-3 font-medium">
              Síguenos en nuestras redes sociales
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.open('https://www.facebook.com/share/1Ca91J72rm/', '_blank')}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                <Facebook className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={() => window.open('https://www.tiktok.com/@neoled_neoled', '_blank')}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                <TiktokIcon className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={() => window.open('https://www.instagram.com/neoled_bolivia/?igsh=bXFvNWt6cjR6bjNm&utm_source=qr#', '_blank')}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                <Instagram className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={() => window.open('https://maps.app.goo.gl/ZdrPRkLNuJz1eHQRA', '_blank')}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-110"
              >
                <MapPin className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
