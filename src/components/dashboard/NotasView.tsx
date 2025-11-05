import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, StickyNote, Bold, List } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getNotes, createNote, updateNote, deleteNote, Note, NoteRequest } from "@/api/NotesApi";

export function NotasView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs para los textareas
  const createTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const notesData = await getNotes();
      setNotes(notesData);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar las notas", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast({ title: "Error", description: "El título es requerido", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const noteRequest: NoteRequest = {
        title: newNote.title,
        content: newNote.content
      };

      const createdNote = await createNote(noteRequest);
      setNotes([createdNote, ...notes]);
      setNewNote({ title: "", content: "" });
      setIsCreating(false);
      toast({ title: "Éxito", description: "Nota creada correctamente" });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo crear la nota", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !editingNote.title.trim()) {
      toast({ title: "Error", description: "El título es requerido", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const noteRequest: NoteRequest = {
        title: editingNote.title,
        content: editingNote.content
      };

      const updatedNote = await updateNote(editingNote.id, noteRequest);
      setNotes(notes.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      setEditingNote(null);
      toast({ title: "Éxito", description: "Nota actualizada correctamente" });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo actualizar la nota", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast({ title: "Éxito", description: "Nota eliminada correctamente" });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar la nota", 
        variant: "destructive" 
      });
    }
  };

  const formatText = (text: string, type: 'bold' | 'list', textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return { newText: text, newCursorPos: 0 };

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    let newText = text;
    let newCursorPos = start;

    if (type === 'bold') {
      // Verificar si el texto seleccionado ya está en negrita
      const isAlreadyBold = selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4;
      
      if (isAlreadyBold) {
        // Remover negrita
        const textWithoutBold = selectedText.substring(2, selectedText.length - 2);
        newText = text.substring(0, start) + textWithoutBold + text.substring(end);
        newCursorPos = start + textWithoutBold.length;
      } else if (selectedText) {
        // Aplicar negrita a texto seleccionado
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        newCursorPos = end + 4;
      } else {
        // Insertar marcadores de negrita sin texto seleccionado
        // Verificar si estamos dentro de un texto en negrita
        const textBefore = text.substring(0, start);
        const textAfter = text.substring(start);
        
        // Buscar el patrón ** más cercano hacia atrás
        const lastBoldStart = textBefore.lastIndexOf('**');
        const hasUnclosedBold = lastBoldStart !== -1 && 
                                !textBefore.substring(lastBoldStart + 2).includes('**') &&
                                textAfter.includes('**');
        
        if (hasUnclosedBold) {
          // Estamos dentro de un texto en negrita, buscar el cierre
          const boldEnd = textAfter.indexOf('**') + start;
          if (boldEnd !== -1) {
            // Mover el cursor después del cierre de negrita
            newCursorPos = boldEnd + 2;
            newText = text; // No cambiar el texto, solo mover el cursor
          } else {
            // No hay cierre, insertar cierre
            newText = text.substring(0, start) + '**' + text.substring(start);
            newCursorPos = start + 2;
          }
        } else {
          // Insertar nuevos marcadores
          newText = text.substring(0, start) + '****' + text.substring(start);
          newCursorPos = start + 2;
        }
      }
    } else if (type === 'list') {
      const lines = text.split('\n');
      const startLine = text.substring(0, start).split('\n').length - 1;
      const endLine = text.substring(0, end).split('\n').length - 1;
      
      let totalAddedChars = 0;
      
      for (let i = startLine; i <= endLine; i++) {
        if (lines[i].startsWith('• ')) {
          // Remover el bullet point
          lines[i] = lines[i].substring(2);
          totalAddedChars -= 2;
        } else {
          // Agregar bullet point
          lines[i] = '• ' + lines[i];
          totalAddedChars += 2;
        }
      }
      
      newText = lines.join('\n');
      newCursorPos = end + totalAddedChars;
    }

    return { newText, newCursorPos };
  };

  const handleFormat = (type: 'bold' | 'list', isEditing = false) => {
    // Determinar qué textarea usar
    const textarea = isEditing ? editTextareaRef.current : createTextareaRef.current;
    
    if (!textarea) return;

    const currentContent = isEditing ? editingNote?.content || "" : newNote.content;
    const result = formatText(currentContent, type, textarea);
    
    if (result) {
      if (isEditing && editingNote) {
        setEditingNote({ ...editingNote, content: result.newText });
      } else {
        setNewNote({ ...newNote, content: result.newText });
      }
      
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(result.newCursorPos, result.newCursorPos);
        }
      });
    }
  };

  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bold text
        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle list items
        if (formattedLine.startsWith('• ')) {
          formattedLine = formattedLine.replace('• ', '');
          return (
            <li key={index} className="ml-4" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          );
        }
        return (
          <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 p-2 md:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Notas</h1>
          <Button disabled className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Nota
          </Button>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Notas</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Nota</DialogTitle>
              <DialogDescription>
                Crea una nueva nota con título y contenido.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="noteTitle">Título</Label>
                <Input
                  id="noteTitle"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Título de la nota"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="noteContent">Contenido</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFormat('bold', false)}
                      title="Negrita (Ctrl+B)"
                      disabled={isSubmitting}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFormat('list', false)}
                      title="Lista con viñetas"
                      disabled={isSubmitting}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    ref={createTextareaRef}
                    id="noteContent"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Contenido de la nota..."
                    className="min-h-[200px]"
                    onKeyDown={(e) => {
                      // Atajo de teclado para negrita (Ctrl+B)
                      if (e.ctrlKey && e.key === 'b') {
                        e.preventDefault();
                        handleFormat('bold', false);
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: "", content: "" });
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateNote} 
                disabled={!newNote.title.trim() || isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crear Nota"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <StickyNote className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="line-clamp-2 text-sm md:text-base">{note.title}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNote({...note})}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {editingNote && editingNote.id === note.id && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Nota</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="editNoteTitle">Título</Label>
                            <Input
                              id="editNoteTitle"
                              value={editingNote.title}
                              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                              disabled={isSubmitting}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="editNoteContent">Contenido</Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFormat('bold', true)}
                                  title="Negrita (Ctrl+B)"
                                  disabled={isSubmitting}
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFormat('list', true)}
                                  title="Lista con viñetas"
                                  disabled={isSubmitting}
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                              </div>
                              <Textarea
                                ref={editTextareaRef}
                                id="editNoteContent"
                                value={editingNote.content}
                                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                className="min-h-[200px]"
                                onKeyDown={(e) => {
                                  // Atajo de teclado para negrita (Ctrl+B)
                                  if (e.ctrlKey && e.key === 'b') {
                                    e.preventDefault();
                                    handleFormat('bold', true);
                                  }
                                }}
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingNote(null)}
                            disabled={isSubmitting}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleEditNote}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar la nota "{note.title}"? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground space-y-2">
                {note.content ? (
                  <div className="prose prose-sm max-w-none">
                    {renderContent(note.content)}
                  </div>
                ) : (
                  <p className="italic">Sin contenido</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                <p>Fecha: {note.createdAt.toLocaleDateString('es-ES')}</p>
                {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                  <p>Editada: {note.updatedAt.toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {notes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay notas aún
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primera nota para comenzar a organizar tus ideas.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Nota
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}