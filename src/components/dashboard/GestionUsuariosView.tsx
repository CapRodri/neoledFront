import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuarioStatus, Usuario, UsuarioRequest } from "@/api/UsersApi";

export function GestionUsuariosView() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    usuario: "",
    contraseña: "",
    rol: "" as "admin" | "asistente" | ""
  });
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      telefono: "",
      usuario: "",
      contraseña: "",
      rol: ""
    });
    setEditandoUsuario(null);
    setMostrandoFormulario(false);
    setEnviandoFormulario(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar teléfono
    if (formData.telefono.length !== 8) {
      toast({
        title: "Error",
        description: "El teléfono debe tener 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    // Bloquear el botón para evitar doble clic
    setEnviandoFormulario(true);
    
    try {
      if (editandoUsuario) {
        // Editar usuario existente
        const usuarioRequest: UsuarioRequest = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          usuario: formData.usuario,
          contraseña: formData.contraseña,
          rol: formData.rol as "admin" | "asistente"
        };
        await updateUsuario(editandoUsuario.id, usuarioRequest);
        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario han sido actualizados correctamente",
        });
      } else {
        // Crear nuevo usuario
        const usuarioRequest: UsuarioRequest = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          usuario: formData.usuario,
          contraseña: formData.contraseña,
          rol: formData.rol as "admin" | "asistente"
        };
        await createUsuario(usuarioRequest);
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado correctamente",
        });
      }
      
      resetForm();
      await cargarUsuarios();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el usuario",
        variant: "destructive",
      });
    } finally {
      // Siempre liberar el botón, tanto en éxito como en error
      setEnviandoFormulario(false);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setEditandoUsuario(usuario);
    setFormData({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      usuario: usuario.usuario,
      contraseña: "", // No cargar la contraseña
      rol: usuario.rol
    });
    setMostrandoFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteUsuario(id);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
      await cargarUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const toggleEstado = async (id: number) => {
    try {
      await toggleUsuarioStatus(id);
      toast({
        title: "Estado actualizado",
        description: "El estado del usuario ha sido actualizado",
      });
      await cargarUsuarios();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el estado",
        variant: "destructive",
      });
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setFormData({ ...formData, telefono: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Gestión de Usuarios</h1>
        <Button onClick={() => setMostrandoFormulario(true)} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {mostrandoFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>{editandoUsuario ? "Editar Usuario" : "Crear Nuevo Usuario"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombres">Nombre(s) *</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellido(s) *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono (8 dígitos) *</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={handleTelefonoChange}
                    maxLength={8}
                    pattern="[0-9]{8}"
                    required
                  />
                  {formData.telefono.length !== 8 && formData.telefono.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">El teléfono debe tener 8 dígitos</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="usuario">Usuario *</Label>
                  <Input
                    id="usuario"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contraseña">
                    Contraseña {editandoUsuario ? "" : "*"}
                  </Label>
                  <Input
                    id="contraseña"
                    type="password"
                    value={formData.contraseña}
                    onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                    required={!editandoUsuario}
                    placeholder={editandoUsuario ? "Dejar en blanco para mantener actual" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="rol">Rol *</Label>
                  <Select 
                    value={formData.rol} 
                    onValueChange={(value) => setFormData({ ...formData, rol: value as "admin" | "asistente" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={enviandoFormulario || (formData.telefono.length !== 8 && formData.telefono.length > 0)}
                >
                  {enviandoFormulario ? "Procesando..." : (editandoUsuario ? "Actualizar" : "Crear")} Usuario
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={enviandoFormulario}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="block md:overflow-x-auto">
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="md:table-row block border-b p-4 md:p-0">
                      <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0 font-medium">
                        <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">USUARIO</div>
                        <div className="text-center md:text-left font-bold text-primary">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="md:hidden text-xs text-muted-foreground text-center">
                          @{usuario.usuario}
                        </div>
                      </TableCell>
                      <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                        <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">TELÉFONO</div>
                        <div className="text-center md:text-left">{usuario.telefono}</div>
                      </TableCell>
                      <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                        <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">ROL</div>
                        <div className="flex justify-center md:justify-start">
                          <Badge variant={usuario.rol === "admin" ? "default" : "secondary"}>
                            {usuario.rol === "admin" ? "Admin" : "Asistente"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-3 md:mb-0">
                        <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">ESTADO</div>
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Switch
                            checked={usuario.activo}
                            onCheckedChange={() => toggleEstado(usuario.id)}
                          />
                          <span className="text-sm">
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="md:table-cell block md:border-0 border-0 p-0">
                        <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">ACCIONES</div>
                        <div className="flex space-x-2 justify-center md:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(usuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el usuario "{usuario.nombres} {usuario.apellidos}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleEliminar(usuario.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}