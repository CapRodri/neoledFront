import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendUsuario {
  idusuario: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  usuario: string;
  rol: "Admin" | "Asistente";
  estado: number;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  usuario: string;
  rol: "admin" | "asistente";
  activo: boolean;
}

export interface UsuarioRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  usuario: string;
  contraseña: string;
  rol: "admin" | "asistente";
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get<BackendUsuario[]>("/users/users");
    return response.data.map((usuario) => ({
      id: usuario.idusuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      usuario: usuario.usuario,
      rol: usuario.rol.toLowerCase() as "admin" | "asistente",
      activo: usuario.estado === 0,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("No se pudieron cargar los usuarios");
  }
};

export const createUsuario = async (usuario: UsuarioRequest): Promise<Usuario> => {
  try {
    const response = await api.post<BackendUsuario>("/users/users", {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      usuario: usuario.usuario,
      contraseña: usuario.contraseña,
      rol: usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1),
    });
    return mapBackendUsuario(response.data);
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("No se pudo crear el usuario");
  }
};

export const updateUsuario = async (id: number, usuario: UsuarioRequest): Promise<Usuario> => {
  try {
    const response = await api.put<BackendUsuario>(`/users/users/${id}`, {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      usuario: usuario.usuario,
      contraseña: usuario.contraseña || undefined,
      rol: usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1),
    });
    return mapBackendUsuario(response.data);
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("No se pudo actualizar el usuario");
  }
};

export const deleteUsuario = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/users/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("No se pudo eliminar el usuario");
  }
};

export const toggleUsuarioStatus = async (id: number): Promise<Usuario> => {
  try {
    const response = await api.patch<BackendUsuario>(`/users/users/${id}/toggle-status`);
    return mapBackendUsuario(response.data);
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw new Error("No se pudo cambiar el estado del usuario");
  }
};

function mapBackendUsuario(usuario: BackendUsuario): Usuario {
  return {
    id: usuario.idusuario,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono,
    usuario: usuario.usuario,
    rol: usuario.rol.toLowerCase() as "admin" | "asistente",
    activo: usuario.estado === 1,
  };
}