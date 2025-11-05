import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, TrendingUp, AlertTriangle, BarChart3, Target, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getProductosMasVendidos, 
  getProductosSinVender, 
  getAnalisisProductos, 
  getObjetivo, 
  createOrUpdateObjetivo,
  getVentasMensuales,
  type ProductoMasVendido,
  type ProductoSinVender,
  type ProductoAnalisis,
  type Objetivo
} from "@/api/ReportesApi";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Componente separado para el objetivo del mes
function ObjetivoMes({ mes, objetivo, actualNum, onActualizarObjetivo, onGuardarObjetivo }: {
  mes: string;
  objetivo?: string;
  actualNum: number;
  onActualizarObjetivo: (mes: string, valor: string) => void;
  onGuardarObjetivo: (mes: string) => void;
}) {
  const objetivoNum = parseFloat(objetivo || "0");
  const faltante = objetivoNum - actualNum;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="font-medium text-lg">{mes}</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`objetivo-${mes}`} className="text-sm">Objetivo (Bs)</Label>
            <Input
              id={`objetivo-${mes}`}
              type="number"
              placeholder="0.00"
              value={objetivo || ""}
              onChange={(e) => onActualizarObjetivo(mes, e.target.value)}
              className="w-full number-input-no-scroll"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm">Monto Actual (Bs)</Label>
            <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center">
              {actualNum.toFixed(2)}
            </div>
          </div>
        </div>
        
        <Button 
          size="sm" 
          onClick={() => onGuardarObjetivo(mes)}
          disabled={!objetivo}
          className="w-full"
        >
          Guardar Objetivo
        </Button>
        
        {objetivoNum > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-3 gap-4 text-sm text-center">
              <div>
                <span className="font-medium">Objetivo:</span> Bs {objetivoNum.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Actual:</span> Bs {actualNum.toFixed(2)}
              </div>
              <div className={faltante > 0 ? "text-orange-600" : "text-green-600"}>
                <span className="font-medium">
                  {faltante > 0 ? `Falta:` : `Superado:`}
                </span> Bs {Math.abs(faltante).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function ReportesView() {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>((new Date().getMonth() + 1).toString());
  const [objetivos, setObjetivos] = useState<{[key: string]: string}>({});
  const [mesActualObjetivos, setMesActualObjetivos] = useState<number>(new Date().getMonth());
  
  // Estados para análisis de productos
  const [mesAnalisis, setMesAnalisis] = useState<string>((new Date().getMonth() + 1).toString());
  const [busquedaProducto, setBusquedaProducto] = useState<string>("");
  const [mostrarTodos, setMostrarTodos] = useState<boolean>(false);
  
  // Estados para datos
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [productosSinVender, setProductosSinVender] = useState<ProductoSinVender[]>([]);
  const [productosAnalisis, setProductosAnalisis] = useState<ProductoAnalisis[]>([]);
  const [ventasMensuales, setVentasMensuales] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState({
    productosMasVendidos: false,
    productosSinVender: false,
    productosAnalisis: false,
    objetivos: false
  });
  
  const { toast } = useToast();

  // Obtener año actual
  const añoActual = new Date().getFullYear();

  // Cargar datos iniciales
  useEffect(() => {
    cargarProductosMasVendidos();
    cargarProductosSinVender();
    cargarAnalisisProductos();
    cargarVentasMensuales();
    cargarObjetivos();
  }, []);

  // Cargar productos más vendidos
  const cargarProductosMasVendidos = async () => {
    setLoading(prev => ({ ...prev, productosMasVendidos: true }));
    try {
      const mes = parseInt(mesSeleccionado);
      const data = await getProductosMasVendidos(mes, añoActual);
      setProductosMasVendidos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos más vendidos",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, productosMasVendidos: false }));
    }
  };

  // Cargar productos sin vender
  const cargarProductosSinVender = async () => {
    setLoading(prev => ({ ...prev, productosSinVender: true }));
    try {
      const data = await getProductosSinVender();
      setProductosSinVender(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos sin vender",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, productosSinVender: false }));
    }
  };

  // Cargar análisis de productos
  const cargarAnalisisProductos = async () => {
    setLoading(prev => ({ ...prev, productosAnalisis: true }));
    try {
      const mes = parseInt(mesAnalisis);
      const data = await getAnalisisProductos(mes, añoActual);
      setProductosAnalisis(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar el análisis de productos",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, productosAnalisis: false }));
    }
  };

  // Cargar ventas mensuales para objetivos
  // En la función cargarVentasMensuales
const cargarVentasMensuales = async () => {
  try {
    const ventas: {[key: string]: number} = {};
    
    for (let mes = 0; mes < 12; mes++) {
      const ventaMes = await getVentasMensuales(mes + 1, añoActual);
      ventas[meses[mes]] = ventaMes.totalIngresos;
    }
    
    setVentasMensuales(ventas);
  } catch (error) {
    console.error("Error cargando ventas mensuales:", error);
    // Inicializar con ceros
    const ventasVacias: {[key: string]: number} = {};
    meses.forEach(mes => {
      ventasVacias[mes] = 0;
    });
    setVentasMensuales(ventasVacias);
  }
};

// En la función cargarObjetivos
const cargarObjetivos = async () => {
  setLoading(prev => ({ ...prev, objetivos: true }));
  try {
    const objetivosData: {[key: string]: string} = {};
    
    for (let mes = 0; mes < 12; mes++) {
      const objetivo = await getObjetivo(mes + 1, añoActual);
      if (objetivo && objetivo.monto) {
        objetivosData[meses[mes]] = objetivo.monto.toString();
      }
    }
    
    setObjetivos(objetivosData);
  } catch (error) {
    console.error("Error cargando objetivos:", error);
    setObjetivos({});
  } finally {
    setLoading(prev => ({ ...prev, objetivos: false }));
  }
};

  // Obtener el monto actual del mes desde ventas mensuales
  const obtenerMontoActual = (mesIndex: number) => {
    const mesNombre = meses[mesIndex];
    return ventasMensuales[mesNombre] || 0;
  };

  // Función mejorada para exportar PDF con diseño de tabla idéntico
  const exportarPDF = (nombreReporte: string, datos: any[], columnas: string[], campos: string[]) => {
    const ventanaImprimir = window.open("", "_blank");
    if (!ventanaImprimir) return;

    const tablaHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            ${columnas.map(col => 
              `<th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold; background-color: #f2f2f2 !important;">${col}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${datos.map((item, index) => `
            <tr>
              ${campos.map(campo => {
                const valor = item[campo];
                // Formatear valores especiales
                let valorFormateado = valor;
                if (campo === 'ingresos' || campo === 'precioVenta' || campo === 'precioCompra' || campo === 'gananciaTotal') {
                  valorFormateado = `Bs ${typeof valor === 'number' ? valor.toFixed(2) : '0.00'}`;
                } else if (campo === 'cantidadVendida' || campo === 'cantidad') {
                  valorFormateado = `<span style="background-color: #f2f2f2; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${valor}</span>`;
                } else if (campo === 'diasSinVender') {
                  valorFormateado = `<span style="background-color: #fef2f2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${valor} días</span>`;
                }
                return `<td style="border: 1px solid #000; padding: 8px; text-align: left;">${valorFormateado}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    ventanaImprimir.document.write(`
      <html>
        <head>
          <title>${nombreReporte}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000 !important; 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse !important; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #000 !important; 
              padding: 8px; 
              text-align: left; 
              color: #000 !important;
            }
            th { 
              background-color: #f2f2f2 !important; 
              font-weight: bold !important;
            }
            .badge {
              background-color: #f2f2f2 !important;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
            }
            .font-bold {
              font-weight: bold !important;
            }
            @media print { 
              body { margin: 0; }
              * { color: #000 !important; }
              th { background-color: #f2f2f2 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${nombreReporte}</h1>
            <p>Generado el: ${new Date().toLocaleDateString()} | Período: ${meses[parseInt(mesSeleccionado) - 1]} ${añoActual}</p>
          </div>
          ${tablaHTML}
        </body>
      </html>
    `);
    ventanaImprimir.document.close();
    ventanaImprimir.print();
    ventanaImprimir.close();
  };

  // Funciones específicas para cada tabla
  const exportarProductosMasVendidosPDF = () => {
    const datos = productosMasVendidos.map(p => ({
      producto: p.producto,
      categoria: p.categoria,
      cantidadVendida: p.cantidadVendida,
      ingresos: p.ingresos
    }));
    
    exportarPDF(
      "Productos Más Vendidos",
      datos,
      ["Producto", "Categoría", "Cantidad Vendida", "Ingresos"],
      ["producto", "categoria", "cantidadVendida", "ingresos"]
    );
  };

  const exportarProductosSinVenderPDF = () => {
    const datos = productosSinVender.map(p => ({
      producto: p.producto,
      categoria: p.categoria,
      ultimaVenta: p.ultimaVenta ? p.ultimaVenta.toLocaleDateString() : "Nunca vendido",
      diasSinVender: p.diasSinVender
    }));
    
    exportarPDF(
      "Productos Sin Vender",
      datos,
      ["Producto", "Categoría", "Última Venta", "Días Sin Vender"],
      ["producto", "categoria", "ultimaVenta", "diasSinVender"]
    );
  };

  const exportarAnalisisProductosPDF = () => {
    const datos = productosFiltrados.map(p => {
      const gananciaTotalProducto = (p.precioVenta - p.precioCompra) * p.cantidadVendida;
      return {
        nombre: p.nombre,
        categoria: p.categoria,
        cantidad: p.cantidadVendida,
        precioVenta: p.precioVenta,
        precioCompra: p.precioCompra,
        gananciaTotal: gananciaTotalProducto
      };
    });
    
    exportarPDF(
      "Análisis de Productos y Ganancias",
      datos,
      ["Producto", "Categoría", "Cantidad", "P. Venta", "P. Compra", "Ganancia Total"],
      ["nombre", "categoria", "cantidad", "precioVenta", "precioCompra", "gananciaTotal"]
    );
  };

  const actualizarObjetivo = (mes: string, valor: string) => {
    setObjetivos(prev => ({
      ...prev,
      [mes]: valor
    }));
  };

  const guardarObjetivo = async (mes: string) => {
    try {
      const objetivoValor = objetivos[mes];
      if (objetivoValor) {
        const mesIndex = meses.indexOf(mes) + 1;
        
        await createOrUpdateObjetivo({
          mes: mesIndex,
          año: añoActual,
          monto: parseFloat(objetivoValor)
        });
        
        toast({
          title: "Objetivo guardado",
          description: `Objetivo de ${mes}: ${objetivoValor} Bs`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el objetivo",
        variant: "destructive"
      });
    }
  };

  // Filtrar productos para análisis
  const productosFiltrados = useMemo(() => {
    let productos = productosAnalisis;

    if (busquedaProducto.trim() && !mostrarTodos) {
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim()) ||
        p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase().trim())
      );
    }

    return productos;
  }, [productosAnalisis, busquedaProducto, mostrarTodos]);

  // Calcular ganancia total
  const gananciaTotal = productosFiltrados.reduce((total, producto) => {
    const gananciaPorProducto = (producto.precioVenta - producto.precioCompra) * producto.cantidadVendida;
    return total + gananciaPorProducto;
  }, 0);

  // Efectos para recargar datos cuando cambian los filtros
  useEffect(() => {
    cargarProductosMasVendidos();
  }, [mesSeleccionado]);

  useEffect(() => {
    cargarAnalisisProductos();
  }, [mesAnalisis]);

  // Función para generar keys únicas
  const generarKeyUnica = (prefijo: string, id: number, index: number) => {
    return `${prefijo}-${id}-${index}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Reportes y Estadísticas</h1>
      </div>

      {/* Productos Más Vendidos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg sm:text-xl">Productos Más Vendidos</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes, index) => (
                  <SelectItem key={mes} value={(index + 1).toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportarProductosMasVendidosPDF} 
              className="w-full sm:w-auto"
              disabled={loading.productosMasVendidos || productosMasVendidos.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.productosMasVendidos ? (
            <div className="text-center py-8">Cargando productos más vendidos...</div>
          ) : (
            <div className="block md:overflow-x-auto">
              <Table>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad Vendida</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosMasVendidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay datos de ventas para {meses[parseInt(mesSeleccionado) - 1]}
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosMasVendidos.map((producto, index) => (
                      <TableRow 
                        key={generarKeyUnica("mas-vendido", producto.id, index)} 
                        className="md:table-row block border-b p-4 md:p-0"
                      >
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0 font-medium">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">PRODUCTO</div>
                          {producto.producto}
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">CATEGORÍA</div>
                          {producto.categoria}
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">CANTIDAD</div>
                          <Badge variant="secondary">{producto.cantidadVendida}</Badge>
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">INGRESOS</div>
                          <div className="font-bold text-primary">Bs {producto.ingresos.toFixed(2)}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productos Sin Vender */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg sm:text-xl">Productos Sin Vender (Hace Mucho Tiempo)</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportarProductosSinVenderPDF} 
            className="w-full sm:w-auto"
            disabled={loading.productosSinVender || productosSinVender.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </CardHeader>
        <CardContent>
          {loading.productosSinVender ? (
            <div className="text-center py-8">Cargando productos sin vender...</div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Última Venta</TableHead>
                    <TableHead>Días Sin Vender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosSinVender.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay productos sin vender por más de 3 meses
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosSinVender.map((producto, index) => (
                      <TableRow 
                        key={generarKeyUnica("sin-vender", producto.id, index)} 
                        className="md:table-row block border-b p-4 md:p-0"
                      >
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0 font-medium">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">PRODUCTO</div>
                          {producto.producto}
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">CATEGORÍA</div>
                          {producto.categoria}
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">ÚLTIMA VENTA</div>
                          {producto.ultimaVenta ? producto.ultimaVenta.toLocaleDateString() : "Nunca vendido"}
                        </TableCell>
                        <TableCell className="md:table-cell block md:border-0 border-0 p-0">
                          <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">DÍAS SIN VENDER</div>
                          <Badge variant="destructive">{producto.diasSinVender} días</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Análisis de Productos y Ganancias */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg sm:text-xl">Análisis de Productos y Ganancias</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={mesAnalisis} onValueChange={setMesAnalisis}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes, index) => (
                  <SelectItem key={mes} value={(index + 1).toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportarAnalisisProductosPDF} 
              className="w-full sm:w-auto"
              disabled={loading.productosAnalisis || productosFiltrados.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className="whitespace-nowrap"
            >
              {mostrarTodos ? "Filtrar" : "Mostrar todos"}
            </Button>
          </div>

          {loading.productosAnalisis ? (
            <div className="text-center py-8">Cargando análisis de productos...</div>
          ) : (
            <>
              {/* Resumen de ganancia total */}
              {productosFiltrados.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Ganancia Total del Mes ({meses[parseInt(mesAnalisis) - 1]})
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    Bs {gananciaTotal.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Tabla de productos */}
              <div className="block md:overflow-x-auto">
                <Table>
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>P. Venta</TableHead>
                      <TableHead>P. Compra</TableHead>
                      <TableHead>Ganancia Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {busquedaProducto.trim() && !mostrarTodos 
                            ? "No se encontraron productos con esa búsqueda" 
                            : "No hay datos de ventas para este período"
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto, index) => {
                        const gananciaTotalProducto = (producto.precioVenta - producto.precioCompra) * producto.cantidadVendida;
                        return (
                          <TableRow 
                            key={generarKeyUnica("analisis", producto.id, index)} 
                            className="md:table-row block border-b p-4 md:p-0"
                          >
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0 font-medium">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">PRODUCTO</div>
                              {producto.nombre}
                            </TableCell>
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">CATEGORÍA</div>
                              {producto.categoria}
                            </TableCell>
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">CANTIDAD</div>
                              <Badge variant="secondary">{producto.cantidadVendida}</Badge>
                            </TableCell>
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">P. VENTA</div>
                              <div className="font-medium text-green-600">Bs {producto.precioVenta.toFixed(2)}</div>
                            </TableCell>
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0 mb-2 md:mb-0">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">P. COMPRA</div>
                              <div className="font-medium text-orange-600">Bs {producto.precioCompra.toFixed(2)}</div>
                            </TableCell>
                            <TableCell className="md:table-cell block md:border-0 border-0 p-0">
                              <div className="md:hidden text-xs font-medium text-muted-foreground mb-1">GANANCIA TOTAL</div>
                              <div className="font-bold text-primary">Bs {gananciaTotalProducto.toFixed(2)}</div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg sm:text-xl">Objetivos Mensuales</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Año: {añoActual}
          </div>
        </CardHeader>
        <CardContent>
          {loading.objetivos ? (
            <div className="text-center py-8">Cargando objetivos...</div>
          ) : (
            <div className="space-y-4">
              {/* Navegación de mes */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMesActualObjetivos(prev => prev === 0 ? 11 : prev - 1)}
                >
                  ← Anterior
                </Button>
                <div className="text-lg font-semibold">{meses[mesActualObjetivos]} {añoActual}</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMesActualObjetivos(prev => prev === 11 ? 0 : prev + 1)}
                >
                  Siguiente →
                </Button>
              </div>

              {/* Objetivo del mes actual */}
              <ObjetivoMes 
                mes={meses[mesActualObjetivos]}
                objetivo={objetivos[meses[mesActualObjetivos]]}
                actualNum={obtenerMontoActual(mesActualObjetivos)}
                onActualizarObjetivo={actualizarObjetivo}
                onGuardarObjetivo={guardarObjetivo}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}