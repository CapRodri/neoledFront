import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BackendNote {
  idnota: number;
  titulo: string;
  contenido: string;
  fecha: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteRequest {
  title: string;
  content: string;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getNotes = async (): Promise<Note[]> => {
  try {
    const response = await api.get<BackendNote[]>("/notes/notes");
    return response.data.map((note) => ({
      id: note.idnota.toString(),
      title: note.titulo,
      content: note.contenido,
      createdAt: new Date(note.fecha),
      updatedAt: new Date(note.fecha),
    }));
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw new Error("No se pudieron cargar las notas");
  }
};

export const createNote = async (note: NoteRequest): Promise<Note> => {
  try {
    const response = await api.post<BackendNote>("/notes/notes", {
      titulo: note.title,
      contenido: note.content,
    });
    return mapBackendNote(response.data);
  } catch (error) {
    console.error("Error creating note:", error);
    throw new Error("No se pudo crear la nota");
  }
};

export const updateNote = async (id: string, note: NoteRequest): Promise<Note> => {
  try {
    const response = await api.put<BackendNote>(`/notes/notes/${id}`, {
      titulo: note.title,
      contenido: note.content,
    });
    return mapBackendNote(response.data);
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("No se pudo actualizar la nota");
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    await api.delete(`/notes/notes/${id}`);
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error("No se pudo eliminar la nota");
  }
};

function mapBackendNote(note: BackendNote): Note {
  return {
    id: note.idnota.toString(),
    title: note.titulo,
    content: note.contenido,
    createdAt: new Date(note.fecha),
    updatedAt: new Date(note.fecha),
  };
}