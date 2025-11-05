import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManagementSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  data: string[];
  onAdd: (name: string) => Promise<void>;
  onEdit: (oldName: string, newName: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onCloseForm: () => void;
  loading: boolean;
  isFormOpen: boolean;
  onToggleForm: (isOpen: boolean) => void;
}

export function ManagementSection({ 
  title, 
  icon: Icon, 
  iconColor, 
  data, 
  onAdd, 
  onEdit, 
  onDelete,
  onCloseForm,
  loading = false,
  isFormOpen,
  onToggleForm
}: ManagementSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Determinar si algún botón debe estar deshabilitado
  const isAnyOperationLoading = loading || isSubmitting;

  const filteredData = useMemo(() => {
    if (!searchTerm) return [];
    return data.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const dataToShow = showAll ? data : filteredData;

  const resetForm = () => {
    setFormName("");
    setEditingItem(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onCloseForm(); // Llamar a la función del padre para cerrar el formulario
    }
    onToggleForm(open); // Actualizar el estado en el padre
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast({
        title: "Error",
        description: "El nombre no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    // Verificar que el nombre no exista ya (excepto si estamos editando)
    const nameExists = data.some(item => 
      item.toLowerCase() === formName.trim().toLowerCase() && 
      item !== editingItem
    );

    if (nameExists) {
      toast({
        title: "Error", 
        description: "Este nombre ya existe",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await onEdit(editingItem, formName.trim());
        toast({
          title: "Editado exitosamente",
          description: `${editingItem} ha sido actualizado a ${formName.trim()}`,
        });
      } else {
        await onAdd(formName.trim());
        toast({
          title: "Agregado exitosamente", 
          description: `${formName.trim()} ha sido agregado a ${title}`,
        });
      }

      resetForm();
      onToggleForm(false); // Cerrar el formulario después de agregar
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: string) => {
    setEditingItem(item);
    setFormName(item);
    onToggleForm(true); // Abrir el formulario para editar
  };

  const handleDelete = async (item: string) => {
    setIsSubmitting(true);
    try {
      await onDelete(item);
      toast({
        title: "Eliminado",
        description: `${item} ha sido eliminado de ${title}`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al eliminar",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onToggleForm(false); // Cerrar el formulario
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de búsqueda y agregar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isAnyOperationLoading}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="whitespace-nowrap"
            disabled={isAnyOperationLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showAll ? "Ocultar" : "Mostrar todos"}
          </Button>
          <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  onToggleForm(true); // Abrir el formulario
                }} 
                className="whitespace-nowrap" 
                disabled={isAnyOperationLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? `Editar ${title.slice(0, -1)}` : `Agregar ${title.slice(0, -1)}`}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={`Nombre del ${title.toLowerCase().slice(0, -1)}`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        disabled={isSubmitting || !formName.trim()}
                      >
                        {isSubmitting ? "Procesando..." : editingItem ? "Actualizar" : "Agregar"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                        <AlertDialogDescription>
                          {editingItem 
                            ? `¿Estás seguro de actualizar "${editingItem}" a "${formName}"?`
                            : `¿Estás seguro de agregar "${formName}" a ${title}?`
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Procesando..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabla de datos */}
        {dataToShow.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataToShow.map((item) => (
                  <TableRow key={item}>
                    <TableCell className="font-medium">{item}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        disabled={isAnyOperationLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={isAnyOperationLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente "{item}" de {title.toLowerCase()}.
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(item)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm && !showAll 
              ? `No se encontraron resultados para "${searchTerm}"`
              : showAll 
              ? `No hay ${title.toLowerCase()} registrados`
              : `Busca o haz clic en "Mostrar todos" para ver los ${title.toLowerCase()}`
            }
          </div>
        )}

        {/* Resumen */}
        <div className="text-sm text-muted-foreground">
          Total de {title.toLowerCase()}: {data.length}
        </div>
      </CardContent>
    </Card>
  );
}