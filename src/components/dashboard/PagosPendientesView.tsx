import { useState, useEffect } from "react";
import { Search, CreditCard, FileText, Eye, Package, Plus, Minus, Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getPagosPendientes, procesarPago, actualizarEntregas, marcarComoEntregado, eliminarPago, PagoPendiente, ProductoCotizado } from "@/api/PagosPendientesApi";

// Simular usuario (en una app real esto vendría de auth context)
const USUARIO_ACTUAL = {
  id: 1,
  nombre: "Usuario Demo"
};

const formatBs = (value: number) => {
  const v = Math.abs(value) < 0.005 ? 0 : value;
  return v.toFixed(2);
};

export function PagosPendientesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "qr">("efectivo");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPago, setSelectedPago] = useState<PagoPendiente | null>(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [pagoParaDetalle, setPagoParaDetalle] = useState<PagoPendiente | null>(null);
  const [showEntregaDialog, setShowEntregaDialog] = useState(false);
  const [pagoParaEntrega, setPagoParaEntrega] = useState<PagoPendiente | null>(null);
  const [montoPago, setMontoPago] = useState<number>(0);
  const [metodoPagoEntrega, setMetodoPagoEntrega] = useState<"efectivo" | "qr">("efectivo");
  const [showConfirmEntrega, setShowConfirmEntrega] = useState(false);
  const [pagoParaEliminar, setPagoParaEliminar] = useState<PagoPendiente | null>(null);
  const [entregasTemporales, setEntregasTemporales] = useState<{[key: string]: number}>({});
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    cargarPagosPendientes();
  }, []);

  // Manejar el botón "atrás" del navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Si algún diálogo está abierto, cerrarlo sin salir de la página
      if (showDetalleDialog || showEntregaDialog || showConfirmEntrega) {
        event.preventDefault();
        
        if (showConfirmEntrega) {
          setShowConfirmEntrega(false);
        } else if (showEntregaDialog) {
          setShowEntregaDialog(false);
          setMontoPago(0);
          setEntregasTemporales({});
        } else if (showDetalleDialog) {
          setShowDetalleDialog(false);
        }
        
        // Agregar una nueva entrada al historial para mantener la posición
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Agregar una entrada inicial al historial
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showDetalleDialog, showEntregaDialog, showConfirmEntrega]);

  const cargarPagosPendientes = async () => {
    try {
      setLoading(true);
      const pagos = await getPagosPendientes();
      setPagosPendientes(pagos);
    } catch (error) {
      console.error("Error cargando pagos pendientes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos pendientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pagos por búsqueda
  const filteredPagos = pagosPendientes.filter(pago =>
    pago.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pago.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pago.telefono.includes(searchQuery)
  );

  const verDetalle = (pago: PagoPendiente) => {
    setPagoParaDetalle(pago);
    setShowDetalleDialog(true);
  };

  const verEntregas = (pago: PagoPendiente) => {
    setPagoParaEntrega(pago);
    setMontoPago(0);
    setMetodoPagoEntrega("efectivo");
    setEntregasTemporales({});
    setShowEntregaDialog(true);
  };

  const actualizarEntregaTemporal = (productoId: string, cantidad: number) => {
    setEntregasTemporales(prev => ({
      ...prev,
      [productoId]: cantidad
    }));
  };

  const handleFinalizarPago = async () => {
    if (!selectedPago) return;
    
    setProcessingAction(`finalizar-pago-${selectedPago.id}`);
    
    try {
      await procesarPago(selectedPago.id, {
        monto: selectedPago.saldo,
        metodoPago: metodoPago,
        idUsuario: USUARIO_ACTUAL.id
      });
      
      setPagosPendientes(prev => 
        prev.map(p => p.id === selectedPago.id ? { ...p, pagado: true, saldo: 0 } : p)
      );
      
      setShowConfirmDialog(false);
      setSelectedPago(null);
      
      toast({
        title: "Pago finalizado",
        description: `Pago de Bs ${formatBs(selectedPago.saldo)} completado exitosamente`,
      });
    } catch (error) {
      console.error("Error procesando pago:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleGuardarEntregas = async () => {
    if (!pagoParaEntrega) return;
    
    setProcessingAction(`guardar-entregas-${pagoParaEntrega.id}`);
    
    try {
      // Preparar productos con las cantidades temporales
      const productosActualizados = pagoParaEntrega.productos.map(producto => ({
        ...producto,
        cantidadEntregada: entregasTemporales[producto.id] || 0
      }));

      await actualizarEntregas(pagoParaEntrega.id, {
        productos: productosActualizados.map(p => ({
          idvariante: parseInt(p.id),
          cantidadEntregada: p.cantidadEntregada
        })),
        montoPago: montoPago > 0 ? montoPago : undefined,
        metodoPago: montoPago > 0 ? metodoPagoEntrega : undefined,
        idUsuario: USUARIO_ACTUAL.id
      });

      // Actualizar estado local
      const updatedPagos = pagosPendientes.map(p => {
        if (p.id === pagoParaEntrega.id) {
          const nuevoSaldo = montoPago > 0 ? Math.max(0, p.saldo - montoPago) : p.saldo;
          const productosConEntregas = p.productos.map(prod => {
            const entregaTemporal = entregasTemporales[prod.id];
            const nuevaCantidadEntregada = entregaTemporal !== undefined ? 
              entregaTemporal : prod.cantidadEntregada;
            return {
              ...prod,
              cantidadEntregada: nuevaCantidadEntregada
            };
          });
          
          const entregado = productosConEntregas.every(prod => prod.cantidadEntregada >= prod.cantidad);
          
          return {
            ...p,
            productos: productosConEntregas,
            saldo: nuevoSaldo,
            pagado: nuevoSaldo <= 0,
            entregado
          };
        }
        return p;
      });

      setPagosPendientes(updatedPagos);
      setShowEntregaDialog(false);
      setShowConfirmEntrega(false);
      setMontoPago(0);
      setEntregasTemporales({});

      toast({
        title: "Cambios guardados",
        description: montoPago > 0 
          ? `Entrega registrada y pago de Bs ${formatBs(montoPago)} recibido`
          : "Entregas actualizadas correctamente",
      });
    } catch (error: any) {
      console.error("Error guardando entregas:", error);
      
      // Mostrar error específico de stock
      if (error.message?.includes("Stock insuficiente")) {
        toast({
          title: "Stock insuficiente",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios",
          variant: "destructive",
        });
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const handleMarcarEntregado = async (pago: PagoPendiente) => {
    setProcessingAction(`marcar-entregado-${pago.id}`);
    
    try {
      await marcarComoEntregado(pago.id);
      
      setPagosPendientes(prev => 
        prev.map(p => p.id === pago.id ? { ...p, entregado: true } : p)
      );
      
      toast({
        title: "Pedido marcado como entregado",
        description: `Cotización ${pago.id} completamente entregada`,
      });
    } catch (error) {
      console.error("Error marcando como entregado:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar como entregado",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEliminarPago = async (pago: PagoPendiente) => {
    setProcessingAction(`eliminar-pago-${pago.id}`);
    
    try {
      // Usar la función real de la API para eliminar
      await eliminarPago(pago.id);
      
      setPagosPendientes(prev => prev.filter(p => p.id !== pago.id));
      setPagoParaEliminar(null);
      
      toast({
        title: "Pago eliminado",
        description: `La cotización ${pago.id} ha sido eliminada correctamente`,
      });
    } catch (error) {
      console.error("Error eliminando pago:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Función para verificar si puede mostrar el botón "Finalizar Entrega"
  const puedeFinalizarEntrega = (pago: PagoPendiente) => {
    const noHayProductosPendientes = pago.productos.every(
      producto => producto.cantidadEntregada >= producto.cantidad
    );
    const noHaySaldoPendiente = pago.saldo <= 0;
    
    return noHayProductosPendientes && noHaySaldoPendiente && !pago.entregado;
  };

  // Función auxiliar para verificar si una acción está en proceso
  const isProcessing = (actionId: string) => processingAction === actionId;

  // Función para manejar el cierre del diálogo de entregas
  const handleCloseEntregaDialog = () => {
    setShowEntregaDialog(false);
    setShowConfirmEntrega(false);
    setMontoPago(0);
    setEntregasTemporales({});
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando pagos pendientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Pagos Pendientes</h1>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, teléfono o número de cotización..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Pagos Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Cotizaciones con Pagos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vista móvil */}
          <div className="block md:hidden space-y-4">
            {filteredPagos.map((pago) => (
              <Card key={pago.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{pago.cliente}</p>
                      <p className="text-xs text-muted-foreground">{pago.telefono}</p>
                      <p className="text-xs text-muted-foreground">{new Date(pago.fecha).toLocaleDateString('es-BO')}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => verDetalle(pago)}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{pago.tipoPago === "pago-adelantado" ? "Pago por Adelantado" : "Mitad de Adelanto"}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">Bs {formatBs(pago.monto)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pendiente:</span>
                    <span className="font-bold text-orange-600">Bs {formatBs(pago.saldo)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verEntregas(pago)}
                      disabled={isProcessing(`entregas-${pago.id}`)}
                    >
                      {isProcessing(`entregas-${pago.id}`) ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                      ) : (
                        <Package className="h-3 w-3 mr-1" />
                      )}
                      Entregas
                    </Button>
                    
                    {pago.entregado ? (
                      <Button
                        variant="default"
                        size="sm"
                        disabled
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Entregado
                      </Button>
                    ) : puedeFinalizarEntrega(pago) ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isProcessing(`marcar-entregado-${pago.id}`)}
                          >
                            {isProcessing(`marcar-entregado-${pago.id}`) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Finalizar Entrega
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar entrega completa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Está seguro de marcar la cotización {pago.id} como completamente entregada?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleMarcarEntregado(pago)}
                              disabled={isProcessing(`marcar-entregado-${pago.id}`)}
                            >
                              {isProcessing(`marcar-entregado-${pago.id}`) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              ) : null}
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isProcessing(`eliminar-${pago.id}`)}
                          >
                            {isProcessing(`eliminar-${pago.id}`) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Está seguro de eliminar la cotización {pago.id} del cliente {pago.cliente}? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleEliminarPago(pago)}
                              disabled={isProcessing(`eliminar-pago-${pago.id}`)}
                            >
                              {isProcessing(`eliminar-pago-${pago.id}`) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              ) : null}
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Vista desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo de Pago</TableHead>
                  <TableHead className="text-right">Monto Total</TableHead>
                  <TableHead className="text-right">Saldo Pendiente</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell>{new Date(pago.fecha).toLocaleDateString('es-BO')}</TableCell>
                    <TableCell className="font-medium">{pago.cliente}</TableCell>
                    <TableCell>{pago.telefono}</TableCell>
                    <TableCell>
                      {pago.tipoPago === "pago-adelantado" ? "Pago por Adelantado" : "Mitad de Adelanto"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Bs {formatBs(pago.monto)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-orange-600">
                      Bs {formatBs(pago.saldo)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => verDetalle(pago)}
                          className="p-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verEntregas(pago)}
                          disabled={isProcessing(`entregas-${pago.id}`)}
                        >
                          {isProcessing(`entregas-${pago.id}`) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          ) : (
                            <Package className="h-3 w-3 mr-1" />
                          )}
                          Entregas
                        </Button>
                        
                        {pago.entregado ? (
                          <Button
                            variant="default"
                            size="sm"
                            disabled
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Entregado
                          </Button>
                        ) : puedeFinalizarEntrega(pago) ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={isProcessing(`marcar-entregado-${pago.id}`)}
                              >
                                {isProcessing(`marcar-entregado-${pago.id}`) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Finalizar Entrega
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar entrega completa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro de marcar la cotización {pago.id} como completamente entregada?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleMarcarEntregado(pago)}
                                  disabled={isProcessing(`marcar-entregado-${pago.id}`)}
                                >
                                  {isProcessing(`marcar-entregado-${pago.id}`) ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                  ) : null}
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isProcessing(`eliminar-${pago.id}`)}
                              >
                                {isProcessing(`eliminar-${pago.id}`) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3 mr-1" />
                                )}
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro de eliminar la cotización {pago.id} del cliente {pago.cliente}? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleEliminarPago(pago)}
                                  disabled={isProcessing(`eliminar-pago-${pago.id}`)}
                                >
                                  {isProcessing(`eliminar-pago-${pago.id}`) ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                  ) : null}
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPagos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron pagos pendientes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalle de Productos */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalle de Cotización {pagoParaDetalle?.id}</DialogTitle>
            <DialogDescription>
              Productos incluidos en la cotización para {pagoParaDetalle?.cliente}
            </DialogDescription>
          </DialogHeader>
          
          {pagoParaDetalle && (
            <div className="space-y-4">
              {/* Información del Cliente */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Cliente:</span>
                    <p className="font-semibold">{pagoParaDetalle.cliente}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Teléfono:</span>
                    <p className="font-semibold">{pagoParaDetalle.telefono}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fecha:</span>
                    <p className="font-semibold">{new Date(pagoParaDetalle.fecha).toLocaleDateString('es-BO')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tipo de Pago:</span>
                    <p className="font-semibold">
                      {pagoParaDetalle.tipoPago === "pago-adelantado" ? "Pago por Adelantado" : "Mitad de Adelanto"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Ubicación:</span>
                    <p className="font-semibold">Cochabamba, Bolivia</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Productos Cotizados</h4>
                <div className="space-y-3">
                  {pagoParaDetalle.productos.map((producto, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium">{producto.nombre}</h5>
                        {producto.color && (
                          <p className="text-sm text-muted-foreground">Color: {producto.color}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm">Cantidad: {producto.cantidad}</span>
                          <span className="font-semibold">Bs {formatBs(producto.precio * producto.cantidad)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-medium">Bs {formatBs(pagoParaDetalle.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-red-600">Descuento Total:</span>
                  <span className="font-medium text-red-600">-Bs 0.00</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">Bs {formatBs(pagoParaDetalle.monto)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-600">Saldo Pendiente:</span>
                  <span className="text-lg font-bold text-orange-600">Bs {formatBs(pagoParaDetalle.saldo)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Gestión de Entregas */}
      <Dialog open={showEntregaDialog} onOpenChange={handleCloseEntregaDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg sm:text-xl">
              Gestión de Entregas - {pagoParaEntrega?.id}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Registrar entregas de productos para {pagoParaEntrega?.cliente}
            </DialogDescription>
          </DialogHeader>
          
          {pagoParaEntrega && (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {pagoParaEntrega.productos.map((producto) => {
                  const cantidadEntregadaTemporal = entregasTemporales[producto.id] ?? producto.cantidadEntregada;
                  const cantidadPendiente = producto.cantidad - producto.cantidadEntregada;
                  
                  return (
                    <div key={producto.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg bg-card">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-16 h-16 rounded-md object-cover mx-auto sm:mx-0"
                      />
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div>
                          <h5 className="font-medium text-sm sm:text-base">{producto.nombre}</h5>
                          {producto.color && (
                            <p className="text-xs sm:text-sm text-muted-foreground">Color: {producto.color}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium ml-1">{producto.cantidad}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Entregado:</span>
                            <span className="font-medium ml-1">{producto.cantidadEntregada}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-muted-foreground">Pendiente:</span>
                            <span className="font-medium text-orange-600 ml-1">{cantidadPendiente}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="text-xs sm:text-sm whitespace-nowrap">Cantidad a entregar:</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const nuevaCantidad = Math.max(0, (entregasTemporales[producto.id] ?? producto.cantidadEntregada) - 1);
                                actualizarEntregaTemporal(producto.id, nuevaCantidad);
                              }}
                              disabled={(entregasTemporales[producto.id] ?? producto.cantidadEntregada) <= 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={entregasTemporales[producto.id] ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  actualizarEntregaTemporal(producto.id, 0);
                                } else {
                                  const cantidad = parseInt(value) || 0;
                                  actualizarEntregaTemporal(producto.id, Math.min(cantidad, producto.cantidad));
                                }
                              }}
                              className="w-16 sm:w-20 text-center text-sm"
                              min="0"
                              max={producto.cantidad}
                              placeholder="0"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const nuevaCantidad = Math.min(
                                  producto.cantidad, 
                                  (entregasTemporales[producto.id] ?? producto.cantidadEntregada) + 1
                                );
                                actualizarEntregaTemporal(producto.id, nuevaCantidad);
                              }}
                              disabled={(entregasTemporales[producto.id] ?? producto.cantidadEntregada) >= producto.cantidad}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground ml-0 sm:ml-2">
                            Máximo: {producto.cantidad}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-primary text-sm sm:text-base">Pago al Entregar</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label className="text-xs sm:text-sm whitespace-nowrap">Monto a recibir:</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={montoPago === 0 ? "" : montoPago}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setMontoPago(0);
                          } else {
                            const monto = parseFloat(value) || 0;
                            setMontoPago(Math.min(monto, pagoParaEntrega.saldo));
                          }
                        }}
                        placeholder="0.00"
                        className="w-32 text-sm"
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        Saldo: Bs {formatBs(pagoParaEntrega.saldo)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Método de Pago:</Label>
                    <RadioGroup 
                      value={metodoPagoEntrega} 
                      onValueChange={(value: "efectivo" | "qr") => setMetodoPagoEntrega(value)}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="efectivo" id="efectivo-entrega" />
                        <Label htmlFor="efectivo-entrega" className="text-xs sm:text-sm">Efectivo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="qr" id="qr-entrega" />
                        <Label htmlFor="qr-entrega" className="text-xs sm:text-sm">QR</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Mostrar imagen QR cuando se selecciona el método QR */}
                  {metodoPagoEntrega === "qr" && (
                    <div className="text-center mt-4">
                      <div className="w-64 h-64 bg-white rounded-lg mx-auto flex items-center justify-center border-2 border-primary/20">
                        <img 
                          src="/qr.jpg" 
                          alt="Código QR para pago" 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Escanea el código QR para pagar
                      </p>
                    </div>

                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseEntregaDialog}
                  className="order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <AlertDialog open={showConfirmEntrega} onOpenChange={setShowConfirmEntrega}>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isProcessing(`guardar-entregas-${pagoParaEntrega.id}`)}
                      className="order-1 sm:order-2"
                    >
                      {isProcessing(`guardar-entregas-${pagoParaEntrega.id}`) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar cambios</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        {montoPago > 0 ? (
                          <>¿Confirmar entrega y pago de Bs {formatBs(montoPago)} mediante {metodoPagoEntrega}?</>
                        ) : (
                          <>¿Confirmar cambios en las entregas sin registrar pago?</>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="m-0">Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleGuardarEntregas}
                        disabled={isProcessing(`guardar-entregas-${pagoParaEntrega.id}`)}
                      >
                        {isProcessing(`guardar-entregas-${pagoParaEntrega.id}`) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        ) : null}
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}