import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Interfaces para cada tipo de dato
interface BackendItem {
  id: number;
  nombre: string;
  estado: number;
}

export interface ManagementItem {
  id: number;
  nombre: string;
  estado: number;
}

export interface ManagementItemRequest {
  nombre: string;
}

// Configuración de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mapeador genérico
function mapBackendItem(item: BackendItem): ManagementItem {
  return {
    id: item.id,
    nombre: item.nombre,
    estado: item.estado,
  };
}

// API para Colores de Diseño
export const getColoresDiseno = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/colores-disenio");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching colores diseño:", error);
    throw new Error("No se pudieron cargar los colores de diseño");
  }
};

export const createColorDiseno = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/colores-disenio", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating color diseño:", error);
    throw new Error("No se pudo crear el color de diseño");
  }
};

export const updateColorDiseno = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/colores-disenio/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating color diseño:", error);
    throw new Error("No se pudo actualizar el color de diseño");
  }
};

export const deleteColorDiseno = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/colores-disenio/${id}`);
  } catch (error) {
    console.error("Error deleting color diseño:", error);
    throw new Error("No se pudo eliminar el color de diseño");
  }
};

// API para Colores de Luz
export const getColoresLuz = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/colores-luz");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching colores luz:", error);
    throw new Error("No se pudieron cargar los colores de luz");
  }
};

export const createColorLuz = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/colores-luz", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating color luz:", error);
    throw new Error("No se pudo crear el color de luz");
  }
};

export const updateColorLuz = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/colores-luz/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating color luz:", error);
    throw new Error("No se pudo actualizar el color de luz");
  }
};

export const deleteColorLuz = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/colores-luz/${id}`);
  } catch (error) {
    console.error("Error deleting color luz:", error);
    throw new Error("No se pudo eliminar el color de luz");
  }
};

// API para Tipos
export const getTipos = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/tipos");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching tipos:", error);
    throw new Error("No se pudieron cargar los tipos");
  }
};

export const createTipo = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/tipos", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating tipo:", error);
    throw new Error("No se pudo crear el tipo");
  }
};

export const updateTipo = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/tipos/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating tipo:", error);
    throw new Error("No se pudo actualizar el tipo");
  }
};

export const deleteTipo = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/tipos/${id}`);
  } catch (error) {
    console.error("Error deleting tipo:", error);
    throw new Error("No se pudo eliminar el tipo");
  }
};

// API para Categorías
export const getCategorias = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/categorias");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching categorias:", error);
    throw new Error("No se pudieron cargar las categorías");
  }
};

export const createCategoria = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/categorias", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating categoria:", error);
    throw new Error("No se pudo crear la categoría");
  }
};

export const updateCategoria = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/categorias/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating categoria:", error);
    throw new Error("No se pudo actualizar la categoría");
  }
};

export const deleteCategoria = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/categorias/${id}`);
  } catch (error) {
    console.error("Error deleting categoria:", error);
    throw new Error("No se pudo eliminar la categoría");
  }
};

// API para Ubicaciones
export const getUbicaciones = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/ubicaciones");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching ubicaciones:", error);
    throw new Error("No se pudieron cargar las ubicaciones");
  }
};

export const createUbicacion = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/ubicaciones", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating ubicacion:", error);
    throw new Error("No se pudo crear la ubicación");
  }
};

export const updateUbicacion = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/ubicaciones/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating ubicacion:", error);
    throw new Error("No se pudo actualizar la ubicación");
  }
};

export const deleteUbicacion = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/ubicaciones/${id}`);
  } catch (error) {
    console.error("Error deleting ubicacion:", error);
    throw new Error("No se pudo eliminar la ubicación");
  }
};

// API para Watts
export const getWatts = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/watts");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching watts:", error);
    throw new Error("No se pudieron cargar los watts");
  }
};

export const createWatt = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/watts", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating watt:", error);
    throw new Error("No se pudo crear el watt");
  }
};

export const updateWatt = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/watts/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating watt:", error);
    throw new Error("No se pudo actualizar el watt");
  }
};

export const deleteWatt = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/watts/${id}`);
  } catch (error) {
    console.error("Error deleting watt:", error);
    throw new Error("No se pudo eliminar el watt");
  }
};

// API para Tamaños
export const getTamanos = async (): Promise<ManagementItem[]> => {
  try {
    const response = await api.get<BackendItem[]>("/management/tamanos");
    return response.data.map(mapBackendItem);
  } catch (error) {
    console.error("Error fetching tamanos:", error);
    throw new Error("No se pudieron cargar los tamaños");
  }
};

export const createTamano = async (item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.post<BackendItem>("/management/tamanos", item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error creating tamano:", error);
    throw new Error("No se pudo crear el tamaño");
  }
};

export const updateTamano = async (id: number, item: ManagementItemRequest): Promise<ManagementItem> => {
  try {
    const response = await api.put<BackendItem>(`/management/tamanos/${id}`, item);
    return mapBackendItem(response.data);
  } catch (error) {
    console.error("Error updating tamano:", error);
    throw new Error("No se pudo actualizar el tamaño");
  }
};

export const deleteTamano = async (id: number): Promise<void> => {
  try {
    await api.delete(`/management/tamanos/${id}`);
  } catch (error) {
    console.error("Error deleting tamano:", error);
    throw new Error("No se pudo eliminar el tamaño");
  }
};