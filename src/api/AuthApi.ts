import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface User {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  rol: string;
  estado: number;
}

export interface LoginRequest {
  usuario: string;
  contraseña: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación - SOLO para rutas protegidas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si es un error 401 y NO estamos en la página de login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    
    if (response.data.success && response.data.token && response.data.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Guardar ID del usuario y rol por separado para fácil acceso
      localStorage.setItem("userId", response.data.user.idUsuario.toString());
      localStorage.setItem("userRole", response.data.user.rol);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error during login:", error);
    
    // Manejar específicamente errores de autenticación en login
    if (error.response?.status === 401) {
      throw new Error(error.response?.data?.message || "Usuario o contraseña incorrectos");
    }
    
    throw new Error(error.response?.data?.message || "Error al iniciar sesión");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
  }
};

export const verifyToken = async (): Promise<AuthStatus> => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    const response = await api.get<{ success: boolean; user: User }>("/auth/verify");
    
    if (response.data.success) {
      // Actualizar también los valores individuales en localStorage
      localStorage.setItem("userId", response.data.user.idUsuario.toString());
      localStorage.setItem("userRole", response.data.user.rol);
      
      return { isAuthenticated: true, user: response.data.user };
    }
    
    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error("Error verifying token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    return { isAuthenticated: false, user: null };
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getUserId = (): number | null => {
  try {
    const userId = localStorage.getItem("userId");
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const getUserRole = (): string | null => {
  try {
    return localStorage.getItem("userRole");
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("token") !== null;
};