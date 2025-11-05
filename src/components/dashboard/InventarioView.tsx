import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter, RefreshCw, X } from "lucide-react";
import { DashboardView } from "@/pages/Dashboard";
import { getInventory, getLowMarginCount, InventoryItem, getCategories, getTypes, Category, ProductType } from "@/api/InventoryApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

interface InventarioViewProps {
  onViewChange?: (view: DashboardView) => void;
}

export const InventarioView = ({ onViewChange }: InventarioViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowMarginOnly, setShowLowMarginOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowMarginCount, setLowMarginCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('searchProductId');
    sessionStorage.removeItem('searchProductName');
    loadInventoryData();
    loadLowMarginCount();
    loadCategories();
    loadTypes();
  }, []);

  useEffect(() => {
    loadInventoryData();
  }, [searchTerm, showLowMarginOnly, selectedCategories, selectedTypes]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInventory(
        searchTerm || undefined, 
        showLowMarginOnly || undefined,
        selectedCategories.length > 0 ? selectedCategories : undefined,
        selectedTypes.length > 0 ? selectedTypes : undefined
      );
      setInventoryData(response.items);
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError("No se pudieron cargar los datos del inventario");
    } finally {
      setLoading(false);
    }
  };

  const loadLowMarginCount = async () => {
    try {
      const count = await getLowMarginCount();
      setLowMarginCount(count);
    } catch (err) {
      console.error("Error loading low margin count:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadTypes = async () => {
    try {
      const typesData = await getTypes();
      setTypes(typesData);
    } catch (err) {
      console.error("Error loading types:", err);
    }
  };

  const handleRefresh = () => {
    loadInventoryData();
    loadLowMarginCount();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  const clearTypeFilters = () => {
    setSelectedTypes([]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSearchTerm("");
    setShowLowMarginOnly(false);
  };

  // Filtrar por término de búsqueda
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMargin = showLowMarginOnly ? item.margenPorcentaje < 50 : true;
    return matchesSearch && matchesMargin;
  });

  const handleViewProduct = (item: InventoryItem) => {
    sessionStorage.setItem('searchProductId', item.baseId || item.id);
    sessionStorage.setItem('searchProductName', item.nombre);
    
    if (onViewChange) {
      onViewChange('productos');
    } else {
      navigate('/dashboard/productos');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Inventario</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Inventario</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtro de Categorías */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Categorías
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Categorías</h4>
                  {selectedCategories.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCategoryFilters}>
                      <X className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="flex-1">
                        {category.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtro de Tipos */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Tipos
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Tipos</h4>
                  {selectedTypes.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearTypeFilters}>
                      <X className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {types.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => handleTypeChange(type.id)}
                      />
                      <Label htmlFor={`type-${type.id}`} className="flex-1">
                        {type.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant={showLowMarginOnly ? "default" : "outline"}
            onClick={() => setShowLowMarginOnly(!showLowMarginOnly)}
            className="w-full sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Margen Bajo ({lowMarginCount})
          </Button>
          
          {(selectedCategories.length > 0 || selectedTypes.length > 0 || searchTerm || showLowMarginOnly) && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                Categoría: {category.nombre}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleCategoryChange(categoryId)}
                />
              </Badge>
            ) : null;
          })}
          {selectedTypes.map(typeId => {
            const type = types.find(t => t.id === typeId);
            return type ? (
              <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                Tipo: {type.nombre}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleTypeChange(typeId)}
                />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <CardTitle>
            Productos en Inventario ({filteredData.length})
            {loading && <span className="text-sm font-normal text-muted-foreground ml-2">Cargando...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead className="px-4 py-3">Nombre</TableHead>
                  <TableHead className="px-4 py-3">Variante</TableHead>
                  <TableHead className="px-4 py-3">P. Compra</TableHead>
                  <TableHead className="px-4 py-3">P. Venta</TableHead>
                  <TableHead className="px-4 py-3">Cantidad</TableHead>
                  <TableHead className="px-4 py-3">Margen (%)</TableHead>
                  <TableHead className="px-4 py-3">Última Edición</TableHead>
                  <TableHead className="px-4 py-3">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {showLowMarginOnly 
                        ? "No hay productos con margen bajo" 
                        : "No se encontraron productos"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="border-b transition-colors hover:bg-muted/50">
                      {/* Desktop View */}
                      <TableCell className="hidden md:table-cell px-4 py-3 font-medium">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                        {item.variante}
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <div className="text-sm">Bs. {item.precioCompra.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <div className="font-medium">Bs. {item.precioVenta.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <span className={`font-medium ${
                          item.cantidad <= item.stockMinimo ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.cantidad}
                          {item.cantidad <= item.stockMinimo && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Mínimo
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <span className={`font-medium ${
                          item.margenPorcentaje < 50 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.margenPorcentaje.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <div className="text-muted-foreground text-sm">{item.ultimaEdicion}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(item)}
                          className="h-8 w-8 p-0"
                          title="Ver producto"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver producto</span>
                        </Button>
                      </TableCell>

                      {/* Mobile View */}
                      <TableCell className="md:hidden px-4 py-3">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{item.nombre}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProduct(item)}
                              className="h-8 w-8 p-0"
                              title="Ver producto"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver producto</span>
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">VARIANTE</div>
                              <div className="text-muted-foreground">{item.variante}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">ÚLTIMA EDICIÓN</div>
                              <div className="text-muted-foreground">{item.ultimaEdicion}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">PRECIO COMPRA</div>
                              <div className="text-sm">Bs. {item.precioCompra.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">PRECIO VENTA</div>
                              <div className="font-medium">Bs. {item.precioVenta.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">CANTIDAD</div>
                              <span className={`font-medium ${
                                item.cantidad <= item.stockMinimo ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {item.cantidad}
                                {item.cantidad <= item.stockMinimo && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Mínimo
                                  </Badge>
                                )}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">MARGEN (%)</div>
                              <span className={`font-medium ${
                                item.margenPorcentaje < 50 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {item.margenPorcentaje.toFixed(1)}%
                              </span>
                            </div>
                          </div>
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
};