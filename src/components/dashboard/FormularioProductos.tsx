import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddItemDialog } from "./AddItemDialog";
import {
  createColorDiseno,
  createColorLuz,
  createWatt,
  createTamano,
  createUbicacion,
  createCategoria,
  createTipo,
  getUbicaciones,
  getCategorias,
  getTipos,
  getColoresDiseno,
  getColoresLuz,
  getWatts,
  getTamanos
} from "@/api/ManagementSectionApi";
import {
  createProducto,
  updateProducto,
  ProductoRequest,
  VarianteRequest
} from "@/api/FormularioProductoApi";

// Interfaces
interface ProductVariant {
  id: string;
  nombreVariante: string;
  precioVenta: string;
  precioCompra?: string;
  colorDiseno: string;
  colorLuz: string;
  watts: string;
  tamaño: string;
  stock: number;
  stockMinimo?: number;
  imagenes: string[];
  imagenesFiles?: File[];
  imagenesExistentes?: string[];
  imagenesAEliminar?: string[];
}

interface ProductFormData {
  id?: string;
  nombre: string;
  categorias: string[];
  tipos: string[];
  descripcion: string;
  ubicacion: string;
  variantes: ProductVariant[];
}

interface FormularioProductosProps {
  product?: any;
  ubicaciones: string[];
  categorias: string[];
  tiposProducto: string[];
  coloresDiseno: string[];
  coloresLuz: string[];
  watts: string[];
  tamaños: string[];
  onSubmit: (productData: ProductFormData, isEditing: boolean) => void;
  onCancel: () => void;
  onRefreshData?: () => void;
}

interface AddDialogState {
  open: boolean;
  type: 'categoria' | 'tipo' | 'colorDiseno' | 'colorLuz' | 'watts' | 'tamaño' | 'ubicacion' | null;
}

interface ManagementItem {
  id: number;
  nombre: string;
  estado: number;
}

export function FormularioProductos({
  product,
  ubicaciones,
  categorias,
  tiposProducto,
  coloresDiseno,
  coloresLuz,
  watts,
  tamaños,
  onSubmit,
  onCancel,
  onRefreshData
}: FormularioProductosProps) {
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (product) {
      return {
        id: product.idproducto?.toString(),
        nombre: product.nombre,
        categorias: product.categorias || [],
        tipos: product.tipos || [],
        descripcion: product.descripcion || "",
        ubicacion: product.ubicacion || "",
        variantes: product.variantes?.map((variant: any) => ({
          id: variant.idvariante?.toString() || `${variant.color_disenio}-${variant.color_luz}-${variant.watt}-${variant.tamano}`.toLowerCase().replace(/\s+/g, '-'),
          nombreVariante: variant.nombre_variante,
          precioVenta: variant.precio_venta?.toString() || "0",
          precioCompra: variant.precio_compra?.toString() || "0",
          colorDiseno: variant.color_disenio,
          colorLuz: variant.color_luz,
          watts: variant.watt,
          tamaño: variant.tamano,
          stock: variant.stock || 0,
          stockMinimo: variant.stock_minimo || 0,
          imagenes: [],
          imagenesFiles: [],
          imagenesExistentes: variant.imagenes || [],
          imagenesAEliminar: []
        })) || []
      };
    }
    return {
      nombre: "",
      categorias: [],
      tipos: [],
      descripcion: "",
      ubicacion: "",
      variantes: []
    };
  });

  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [addDialogState, setAddDialogState] = useState<AddDialogState>({ open: false, type: null });
  const [currentVariant, setCurrentVariant] = useState<ProductVariant>({
    id: "",
    nombreVariante: "",
    precioVenta: "",
    precioCompra: "",
    colorDiseno: "",
    colorLuz: "",
    watts: "",
    tamaño: "",
    stock: 0,
    stockMinimo: 0,
    imagenes: [],
    imagenesFiles: [],
    imagenesExistentes: [],
    imagenesAEliminar: []
  });

  const [localLists, setLocalLists] = useState({
    ubicaciones: ubicaciones,
    categorias: categorias,
    tiposProducto: tiposProducto,
    coloresDiseno: coloresDiseno,
    coloresLuz: coloresLuz,
    watts: watts,
    tamaños: tamaños
  });

  const [managementItems, setManagementItems] = useState<{
    ubicaciones: ManagementItem[];
    categorias: ManagementItem[];
    tipos: ManagementItem[];
    coloresDiseno: ManagementItem[];
    coloresLuz: ManagementItem[];
    watts: ManagementItem[];
    tamanos: ManagementItem[];
  }>({
    ubicaciones: [],
    categorias: [],
    tipos: [],
    coloresDiseno: [],
    coloresLuz: [],
    watts: [],
    tamanos: []
  });

  // Estados para controlar la carga de los botones
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [isAddingElement, setIsAddingElement] = useState(false);

  const { toast } = useToast();

  // Cargar los elementos de gestión al montar el componente
  useEffect(() => {
    const loadManagementItems = async () => {
      try {
        const [
          ubicacionesData,
          categoriasData,
          tiposData,
          coloresDisenoData,
          coloresLuzData,
          wattsData,
          tamanosData
        ] = await Promise.all([
          getUbicaciones(),
          getCategorias(),
          getTipos(),
          getColoresDiseno(),
          getColoresLuz(),
          getWatts(),
          getTamanos()
        ]);

        setManagementItems({
          ubicaciones: ubicacionesData,
          categorias: categoriasData,
          tipos: tiposData,
          coloresDiseno: coloresDisenoData,
          coloresLuz: coloresLuzData,
          watts: wattsData,
          tamanos: tamanosData
        });

        // Actualizar las listas locales con los datos frescos del backend
        setLocalLists({
          ubicaciones: ubicacionesData.map(item => item.nombre),
          categorias: categoriasData.map(item => item.nombre),
          tiposProducto: tiposData.map(item => item.nombre),
          coloresDiseno: coloresDisenoData.map(item => item.nombre),
          coloresLuz: coloresLuzData.map(item => item.nombre),
          watts: wattsData.map(item => item.nombre),
          tamaños: tamanosData.map(item => item.nombre)
        });

      } catch (error) {
        console.error("Error cargando elementos de gestión:", error);
      }
    };

    loadManagementItems();
  }, []);

  // Actualizar las listas locales cuando cambien las props
  useEffect(() => {
    setLocalLists({
      ubicaciones: ubicaciones,
      categorias: categorias,
      tiposProducto: tiposProducto,
      coloresDiseno: coloresDiseno,
      coloresLuz: coloresLuz,
      watts: watts,
      tamaños: tamaños
    });
  }, [ubicaciones, categorias, tiposProducto, coloresDiseno, coloresLuz, watts, tamaños]);

  const handleInputChange = (field: keyof ProductFormData, value: string | string[] | ProductVariant[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función MEJORADA para formatear la descripción que funciona en producción
  const formatDescriptionForProduction = (description: string): string => {
    if (!description) return "";
    
    // Para producción: normalizar todos los tipos de saltos de línea
    return description
      .replace(/\r\n/g, '\n')  // Windows a Unix
      .replace(/\r/g, '\n')    // Mac antiguo a Unix
      .replace(/\n+/g, '\n')   // Múltiples saltos a uno solo
      .replace(/[ ]+/g, ' ')   // Múltiples espacios a uno solo
      .trim();
  };

  // Función para verificar si al menos un campo de características está completado
  const hasAtLeastOneCharacteristic = (variant: ProductVariant): boolean => {
    return !!variant.colorDiseno || !!variant.colorLuz || !!variant.watts || !!variant.tamaño;
  };

  // Función para generar sugerencia automática
  const generateAutoSuggestion = (variant: ProductVariant): string => {
    const characteristics = [];
    
    if (variant.colorDiseno) characteristics.push(variant.colorDiseno);
    if (variant.colorLuz) characteristics.push(variant.colorLuz);
    if (variant.watts) characteristics.push(variant.watts);
    if (variant.tamaño) characteristics.push(variant.tamaño);
    
    if (characteristics.length === 0) return "";
    
    return `${formData.nombre} ${characteristics.join(' ')}`;
  };

  const addVariant = async () => {
    if (isAddingVariant) return; // Prevenir doble clic
    
    if (!currentVariant.nombreVariante || !currentVariant.precioVenta || currentVariant.stock <= 0) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios de la variante (nombre, precio y stock)",
        variant: "destructive"
      });
      return;
    }

    // Verificar que al menos una característica esté completada
    if (!hasAtLeastOneCharacteristic(currentVariant)) {
      toast({
        title: "Error",
        description: "Debe completar al menos uno de los siguientes campos: Color de Diseño, Color de Luz, Watts o Tamaño",
        variant: "destructive"
      });
      return;
    }

    setIsAddingVariant(true);

    try {
      const variantId = editingVariantIndex !== null ? currentVariant.id : 
                       `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newVariant = { 
        ...currentVariant, 
        id: variantId,
        imagenesFiles: currentVariant.imagenesFiles || [],
        imagenesExistentes: currentVariant.imagenesExistentes || [],
        imagenesAEliminar: currentVariant.imagenesAEliminar || []
      };

      if (editingVariantIndex !== null) {
        const updatedVariants = [...formData.variantes];
        updatedVariants[editingVariantIndex] = newVariant;
        setFormData(prev => ({ ...prev, variantes: updatedVariants }));
        setEditingVariantIndex(null);
      } else {
        setFormData(prev => ({ ...prev, variantes: [...prev.variantes, newVariant] }));
      }

      setCurrentVariant({
        id: "",
        nombreVariante: "",
        precioVenta: "",
        precioCompra: "",
        colorDiseno: "",
        colorLuz: "",
        watts: "",
        tamaño: "",
        stock: 0,
        stockMinimo: 0,
        imagenes: [],
        imagenesFiles: [],
        imagenesExistentes: [],
        imagenesAEliminar: []
      });

      toast({
        title: editingVariantIndex !== null ? "Variante actualizada" : "Variante agregada",
        description: editingVariantIndex !== null 
          ? "La variante ha sido actualizada exitosamente."
          : "La variante ha sido agregada exitosamente.",
      });
    } catch (error) {
      console.error("Error al agregar variante:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la variante. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsAddingVariant(false);
    }
  };

  const editVariant = (index: number) => {
    const variant = formData.variantes[index];
    setCurrentVariant({
      ...variant,
      imagenesFiles: variant.imagenesFiles || [],
      imagenesExistentes: variant.imagenesExistentes || [],
      imagenesAEliminar: variant.imagenesAEliminar || []
    });
    setEditingVariantIndex(index);
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
  };

  const getItemIdByName = (items: ManagementItem[], name: string): number => {
    const item = items.find(item => item.nombre === name);
    return item?.id || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingProduct) return; // Prevenir doble clic
    
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del producto es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ubicacion) {
      toast({
        title: "Error",
        description: "La ubicación es obligatoria",
        variant: "destructive"
      });
      return;
    }

    if (formData.categorias.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una categoría",
        variant: "destructive"
      });
      return;
    }

    if (formData.tipos.length === 0) {
      toast({
        title: "Error", 
        description: "Debe seleccionar al menos un tipo",
        variant: "destructive"
      });
      return;
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción es obligatoria",
        variant: "destructive"
      });
      return;
    }

    if (formData.variantes.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una variante del producto",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingProduct(true);

    try {
      // Obtener el ID de la ubicación seleccionada
      const idubicacion = getItemIdByName(managementItems.ubicaciones, formData.ubicacion);
      
      if (idubicacion === 0) {
        toast({
          title: "Error",
          description: "La ubicación seleccionada no es válida",
          variant: "destructive"
        });
        setIsSubmittingProduct(false);
        return;
      }

      // Formatear la descripción para producción
      const descripcionFormateada = formatDescriptionForProduction(formData.descripcion);
      
      console.log("DEBUG - Descripción a enviar:", {
        original: formData.descripcion,
        formateada: descripcionFormateada,
        longitud: descripcionFormateada.length,
        contieneSaltos: descripcionFormateada.includes('\n')
      });

      // Preparar datos para el backend
      const productoRequest = {
        nombre: formData.nombre,
        descripcion: descripcionFormateada, // Usar la descripción formateada
        idubicacion: idubicacion,
        categorias: formData.categorias.map(cat => getItemIdByName(managementItems.categorias, cat)),
        tipos: formData.tipos.map(tipo => getItemIdByName(managementItems.tipos, tipo)),
        variantes: formData.variantes.map(variant => ({
          idvariante: variant.id && variant.id.includes('-') ? 0 : parseInt(variant.id) || 0,
          nombre_variante: variant.nombreVariante,
          precio_venta: parseFloat(variant.precioVenta) || 0,
          precio_compra: parseFloat(variant.precioCompra || "0") || 0,
          idcolor_disenio: variant.colorDiseno ? getItemIdByName(managementItems.coloresDiseno, variant.colorDiseno) : null,
          idcolor_luz: variant.colorLuz ? getItemIdByName(managementItems.coloresLuz, variant.colorLuz) : null,
          idwatt: variant.watts ? getItemIdByName(managementItems.watts, variant.watts) : null,
          idtamano: variant.tamaño ? getItemIdByName(managementItems.tamanos, variant.tamaño) : null,
          stock: variant.stock,
          stock_minimo: variant.stockMinimo || 0,
          imagenes_existentes: variant.imagenesExistentes?.filter(img => 
            !variant.imagenesAEliminar?.includes(img)
          ) || []
        }))
      };

      console.log("Enviando datos:", productoRequest);

      // Crear FormData de manera más eficiente
      const formDataToSend = new FormData();
      
      // Agregar campos individualmente
      formDataToSend.append('nombre', productoRequest.nombre);
      formDataToSend.append('descripcion', productoRequest.descripcion);
      formDataToSend.append('idubicacion', productoRequest.idubicacion.toString());
      
      // Enviar arrays como strings JSON individuales
      formDataToSend.append('categorias', JSON.stringify(productoRequest.categorias));
      formDataToSend.append('tipos', JSON.stringify(productoRequest.tipos));
      
      // Enviar variantes como string JSON
      formDataToSend.append('variantes', JSON.stringify(productoRequest.variantes));

      // Agregar archivos de imágenes
      formData.variantes.forEach((variante, index) => {
        if (variante.imagenesFiles && variante.imagenesFiles.length > 0) {
          variante.imagenesFiles.forEach((imagen) => {
            formDataToSend.append(`variantes[${index}][imagenes]`, imagen);
          });
        }
      });

      let response;
      if (product && formData.id) {
        // Modo edición
        response = await updateProducto(parseInt(formData.id), formDataToSend);
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado exitosamente.",
        });
      } else {
        // Modo creación
        response = await createProducto(formDataToSend);
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado exitosamente.",
        });
      }

      onSubmit(formData, !!product);
    } catch (error: any) {
      console.error("Error al guardar el producto:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const openAddDialog = (type: 'categoria' | 'tipo' | 'colorDiseno' | 'colorLuz' | 'watts' | 'tamaño' | 'ubicacion') => {
    setAddDialogState({ open: true, type });
  };

  // Función mejorada para actualizar las listas desde el backend
  const updateLocalList = async (type: string) => {
    try {
      let newData: ManagementItem[] = [];
      
      switch (type) {
        case 'ubicacion':
          newData = await getUbicaciones();
          setManagementItems(prev => ({ ...prev, ubicaciones: newData }));
          setLocalLists(prev => ({ ...prev, ubicaciones: newData.map(item => item.nombre) }));
          break;
        case 'categoria':
          newData = await getCategorias();
          setManagementItems(prev => ({ ...prev, categorias: newData }));
          setLocalLists(prev => ({ ...prev, categorias: newData.map(item => item.nombre) }));
          break;
        case 'tipo':
          newData = await getTipos();
          setManagementItems(prev => ({ ...prev, tipos: newData }));
          setLocalLists(prev => ({ ...prev, tiposProducto: newData.map(item => item.nombre) }));
          break;
        case 'colorDiseno':
          newData = await getColoresDiseno();
          setManagementItems(prev => ({ ...prev, coloresDiseno: newData }));
          setLocalLists(prev => ({ ...prev, coloresDiseno: newData.map(item => item.nombre) }));
          break;
        case 'colorLuz':
          newData = await getColoresLuz();
          setManagementItems(prev => ({ ...prev, coloresLuz: newData }));
          setLocalLists(prev => ({ ...prev, coloresLuz: newData.map(item => item.nombre) }));
          break;
        case 'watts':
          newData = await getWatts();
          setManagementItems(prev => ({ ...prev, watts: newData }));
          setLocalLists(prev => ({ ...prev, watts: newData.map(item => item.nombre) }));
          break;
        case 'tamaño':
          newData = await getTamanos();
          setManagementItems(prev => ({ ...prev, tamanos: newData }));
          setLocalLists(prev => ({ ...prev, tamaños: newData.map(item => item.nombre) }));
          break;
        default:
          return;
      }

    } catch (error) {
      console.error(`Error actualizando lista ${type}:`, error);
    }
  };

  const handleAddNewElement = async (name: string) => {
    if (isAddingElement) return; // Prevenir doble clic
    
    const type = addDialogState.type;
    if (!type) return;

    setIsAddingElement(true);

    try {
      switch (type) {
        case 'categoria':
          await createCategoria({ nombre: name });
          break;
        case 'tipo':
          await createTipo({ nombre: name });
          break;
        case 'colorDiseno':
          await createColorDiseno({ nombre: name });
          break;
        case 'colorLuz':
          await createColorLuz({ nombre: name });
          break;
        case 'watts':
          await createWatt({ nombre: name });
          break;
        case 'tamaño':
          await createTamano({ nombre: name });
          break;
        case 'ubicacion':
          await createUbicacion({ nombre: name });
          break;
      }

      // Actualizar la lista específica desde el backend
      await updateLocalList(type);

      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} agregado`,
        description: `El ${type} "${name}" ha sido agregado exitosamente.`,
      });

      if (onRefreshData) {
        onRefreshData();
      }

      setAddDialogState({ open: false, type: null });

    } catch (error) {
      console.error(`Error agregando ${type}:`, error);
      toast({
        title: "Error",
        description: `No se pudo agregar el ${type}`,
        variant: "destructive"
      });
    } finally {
      setIsAddingElement(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    
    setCurrentVariant(prev => ({ 
      ...prev, 
      imagenes: [...prev.imagenes, ...newImages],
      imagenesFiles: [...(prev.imagenesFiles || []), ...files]
    }));
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Eliminar imagen existente - agregar a la lista de eliminación
      const imageToRemove = currentVariant.imagenesExistentes![index];
      setCurrentVariant(prev => ({
        ...prev,
        imagenesExistentes: prev.imagenesExistentes?.filter((_, i) => i !== index) || [],
        imagenesAEliminar: [...(prev.imagenesAEliminar || []), imageToRemove]
      }));
    } else {
      // Eliminar nueva imagen
      setCurrentVariant(prev => ({
        ...prev,
        imagenes: prev.imagenes.filter((_, i) => i !== index),
        imagenesFiles: prev.imagenesFiles?.filter((_, i) => i !== index) || []
      }));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <select
                value={formData.ubicacion}
                onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Seleccionar ubicación</option>
                {localLists.ubicaciones.map(ubicacion => (
                  <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                ))}
              </select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    className="flex-shrink-0"
                    disabled={isAddingElement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de abrir el formulario para agregar una nueva ubicación?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => openAddDialog("ubicacion")}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categorías <span className="text-red-500">*</span></Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => openAddDialog("categoria")}
              disabled={isAddingElement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SearchSelect
            options={localLists.categorias}
            selectedValues={formData.categorias}
            onSelectionChange={(values) => handleInputChange("categorias", values)}
            placeholder="Buscar categorías..."
            label=""
          />
        </div>

        {/* Tipos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tipos <span className="text-red-500">*</span></Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => openAddDialog("tipo")}
              disabled={isAddingElement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SearchSelect
            options={localLists.tiposProducto}
            selectedValues={formData.tipos}
            onSelectionChange={(values) => handleInputChange("tipos", values)}
            placeholder="Buscar tipos..."
            label=""
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción <span className="text-red-500">*</span></Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => handleInputChange("descripcion", e.target.value)}
            rows={3}
            placeholder="Escribe la descripción del producto. Puedes usar saltos de línea para mejor formato."
            required
          />
          <div className="text-xs text-muted-foreground">
            Los saltos de línea se mantendrán en la visualización del producto.
          </div>
        </div>

        {/* Gestión de Variantes */}
        <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
          <h3 className="text-lg font-semibold">Variantes del Producto</h3>
          
          {/* Formulario para agregar/editar variante */}
          <div className="border rounded-lg p-3 md:p-4 space-y-3 md:space-y-4">
            <h4 className="font-medium">{editingVariantIndex !== null ? "Editar" : "Agregar"} Variante</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nombreVariante">Nombre de Variante <span className="text-red-500">*</span></Label>
                <Input
                  id="nombreVariante"
                  value={currentVariant.nombreVariante}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, nombreVariante: e.target.value }))}
                  placeholder="Ej: Tira Led 50W 30cm Rojo - Rojo o generado automáticamente"
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Puedes escribirlo manualmente o dejar que se genere automáticamente basado en las opciones seleccionadas
                </div>
                {hasAtLeastOneCharacteristic(currentVariant) && (
                  <div className="text-xs font-semibold text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                    Sugerencia automática: {generateAutoSuggestion(currentVariant)}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-xs text-yellow-700 hover:text-yellow-800"
                      onClick={() => {
                        const autoName = generateAutoSuggestion(currentVariant);
                        setCurrentVariant(prev => ({ ...prev, nombreVariante: autoName }));
                      }}
                    >
                      Usar esta sugerencia
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioVenta">Precio Venta (Bs) <span className="text-red-500">*</span></Label>
                <Input
                  id="precioVenta"
                  type="number"
                  step="0.01"
                  value={currentVariant.precioVenta}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, precioVenta: e.target.value }))}
                  className="number-input-no-scroll"
                  onWheel={(e) => e.currentTarget.blur()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioCompra">Precio Compra (Bs)</Label>
                <Input
                  id="precioCompra"
                  type="number"
                  step="0.01"
                  value={currentVariant.precioCompra}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, precioCompra: e.target.value }))}
                  className="number-input-no-scroll"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="space-y-2">
                <Label>Color de Diseño</Label>
                <div className="flex gap-2">
                  <select
                    value={currentVariant.colorDiseno}
                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorDiseno: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar color</option>
                    {localLists.coloresDiseno.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={isAddingElement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de abrir el formulario para agregar un nuevo color de diseño?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => openAddDialog("colorDiseno")}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color de Luz</Label>
                <div className="flex gap-2">
                  <select
                    value={currentVariant.colorLuz}
                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorLuz: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar color</option>
                    {localLists.coloresLuz.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={isAddingElement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de abrir el formulario para agregar un nuevo color de luz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => openAddDialog("colorLuz")}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Watts</Label>
                <div className="flex gap-2">
                  <select
                    value={currentVariant.watts}
                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, watts: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar watts</option>
                    {localLists.watts.map(watt => (
                      <option key={watt} value={watt}>{watt}</option>
                    ))}
                  </select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={isAddingElement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de abrir el formulario para agregar un nuevo watt?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => openAddDialog("watts")}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tamaño</Label>
                <div className="flex gap-2">
                  <select
                    value={currentVariant.tamaño}
                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, tamaño: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar tamaño</option>
                    {localLists.tamaños.map(tamaño => (
                      <option key={tamaño} value={tamaño}>{tamaño}</option>
                    ))}
                  </select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={isAddingElement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de abrir el formulario para agregar un nuevo tamaño?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => openAddDialog("tamaño")}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stock de esta variante <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={currentVariant.stock || ""}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  className="number-input-no-scroll"
                  onWheel={(e) => e.currentTarget.blur()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Mínimo</Label>
                <Input
                  type="number"
                  value={currentVariant.stockMinimo || ""}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  className="number-input-no-scroll"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Imágenes de esta variante</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="text-xs text-muted-foreground">
                  {currentVariant.imagenesExistentes && currentVariant.imagenesExistentes.length > 0 && 
                    `Imágenes existentes: ${currentVariant.imagenesExistentes.length}. Agregar nuevas imágenes reemplazarán las existentes.`
                  }
                </div>
              </div>
            </div>

            {(currentVariant.imagenes.length > 0 || (currentVariant.imagenesExistentes && currentVariant.imagenesExistentes.length > 0)) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {/* Mostrar imágenes existentes */}
                {currentVariant.imagenesExistentes && currentVariant.imagenesExistentes.map((image, index) => (
                  <div key={`exist-${index}`} className="relative">
                    <img src={image} alt={`Existente ${index + 1}`} className="w-full h-20 object-cover rounded border-2 border-green-500" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index, true)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">Existente</div>
                  </div>
                ))}
                {/* Mostrar nuevas imágenes */}
                {currentVariant.imagenes.map((image, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img src={image} alt={`Nueva ${index + 1}`} className="w-full h-20 object-cover rounded border-2 border-blue-500" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Nueva</div>
                  </div>
                ))}
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  className="w-full"
                  disabled={isAddingVariant}
                >
                  {isAddingVariant ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingVariantIndex !== null ? "Actualizando..." : "Agregando..."}
                    </>
                  ) : (
                    editingVariantIndex !== null ? "Actualizar Variante" : "Agregar Variante"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                  <AlertDialogDescription>
                    {editingVariantIndex !== null
                      ? "¿Estás seguro de actualizar esta variante?"
                      : "¿Estás seguro de agregar esta variante?"
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isAddingVariant}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={addVariant}
                    disabled={isAddingVariant}
                  >
                    {isAddingVariant ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Lista de variantes agregadas */}
          {formData.variantes.length > 0 && (
            <div className="space-y-2">
              <Label>Variantes agregadas:</Label>
              <div className="space-y-2">
                {formData.variantes.map((variant, index) => (
                  <div key={variant.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-accent rounded-lg gap-2">
                    <div className="flex-1">
                      <span className="font-medium">{variant.nombreVariante}</span>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {[
                          variant.colorDiseno,
                          variant.colorLuz, 
                          variant.watts,
                          variant.tamaño
                        ].filter(Boolean).join(' • ')}
                      </span>
                      <br />
                      <span className="text-sm text-primary">Precio: Bs {variant.precioVenta}</span>
                      <span className="ml-2 text-sm text-muted-foreground">Stock: {variant.stock}</span>
                      {(variant.imagenes.length > 0 || (variant.imagenesExistentes && variant.imagenesExistentes.length > 0)) && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({variant.imagenesExistentes?.length || 0} existentes, {variant.imagenes.length} nuevas)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editVariant(index)}
                        disabled={isAddingVariant}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        disabled={isAddingVariant}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="w-full sm:w-auto"
            disabled={isSubmittingProduct || isAddingVariant || isAddingElement}
          >
            Cancelar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                disabled={isSubmittingProduct || isAddingVariant || isAddingElement}
              >
                {isSubmittingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {product ? "Actualizando..." : "Agregando..."}
                  </>
                ) : (
                  product ? "Actualizar Producto" : "Agregar Producto"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
                <AlertDialogDescription>
                  {product 
                    ? `¿Estás seguro de actualizar el producto "${formData.nombre}"?`
                    : `¿Estás seguro de agregar el producto "${formData.nombre}"?`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmittingProduct}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSubmit}
                  disabled={isSubmittingProduct}
                >
                  {isSubmittingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>

      {/* Diálogo para agregar nuevos elementos */}
      <AddItemDialog
        open={addDialogState.open}
        onOpenChange={(open) => setAddDialogState({ open, type: null })}
        title={`Agregar ${
          addDialogState.type === 'categoria' ? 'Categoría' :
          addDialogState.type === 'tipo' ? 'Tipo' :
          addDialogState.type === 'colorDiseno' ? 'Color de Diseño' :
          addDialogState.type === 'colorLuz' ? 'Color de Luz' :
          addDialogState.type === 'watts' ? 'Watts' :
          addDialogState.type === 'tamaño' ? 'Tamaño' :
          addDialogState.type === 'ubicacion' ? 'Ubicación' : ''
        }`}
        itemType={
          addDialogState.type === 'categoria' ? 'categorías' :
          addDialogState.type === 'tipo' ? 'tipos' :
          addDialogState.type === 'colorDiseno' ? 'colores de diseño' :
          addDialogState.type === 'colorLuz' ? 'colores de luz' :
          addDialogState.type === 'watts' ? 'watts' :
          addDialogState.type === 'tamaño' ? 'tamaños' :
          addDialogState.type === 'ubicacion' ? 'ubicaciones' : ''
        }
        onAdd={handleAddNewElement}
      />
    </>
  );
}

// Componente para buscar y seleccionar opciones
interface SearchSelectProps {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}

const SearchSelect = ({ options, selectedValues, onSelectionChange, placeholder, label, required }: SearchSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option)
  );

  const addSelection = (option: string) => {
    onSelectionChange([...selectedValues, option]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const removeSelection = (option: string) => {
    onSelectionChange(selectedValues.filter(v => v !== option));
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
        />
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredOptions.map(option => (
              <button
                key={option}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => addSelection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map(value => (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {value}
              <button
                type="button"
                onClick={() => removeSelection(value)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};