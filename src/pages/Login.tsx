import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { login, LoginRequest } from "@/api/AuthApi";

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    contraseña: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ usuario: "", contraseña: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = { usuario: "", contraseña: "" };
    let isValid = true;

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
      isValid = false;
    }

    if (!formData.contraseña.trim()) {
      newErrors.contraseña = "La contraseña es requerida";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const credentials: LoginRequest = { 
      usuario: formData.usuario, 
      contraseña: formData.contraseña 
    };
    
    const result = await login(credentials);

    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      
      // Redireccionar a la ruta guardada o al dashboard por defecto
      const redirectPath = localStorage.getItem("redirectPath") || "/dashboard/vender";
      localStorage.removeItem("redirectPath");
      
      navigate(redirectPath, { replace: true });
    } else {
      toast({
        title: "Error",
        description: result.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error de autenticación",
      description: error.message || "Credenciales incorrectas",
      variant: "destructive",
    });
    
    setFormData(prev => ({
      ...prev,
      contraseña: ""
    }));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/84af3e7f-9171-4c73-900f-9499a9673234.png" 
              alt="NEOLED Logo" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.usuario}
                onChange={(e) => handleInputChange("usuario", e.target.value)}
                required
                disabled={isLoading}
                className={errors.usuario ? "border-destructive" : ""}
              />
              {errors.usuario && (
                <p className="text-sm text-destructive">{errors.usuario}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <div className="relative">
                <Input
                  id="contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={formData.contraseña}
                  onChange={(e) => handleInputChange("contraseña", e.target.value)}
                  required
                  disabled={isLoading}
                  className={errors.contraseña ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.contraseña && (
                <p className="text-sm text-destructive">{errors.contraseña}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;