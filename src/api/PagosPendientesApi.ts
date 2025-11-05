  import axios from "axios";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  interface BackendProductoCotizado {
    idvariante: number;
    nombre: string;
    precio_unitario: string;
    cantidad: number;
    cantidad_pendiente: number;
    color_disenio?: string;
    color_luz?: string;
    watt?: string;
    tamano?: string;
    imagen?: string;
  }

  interface BackendPagoPendiente {
    idcotizacion: number;
    fecha: string;
    cliente_nombre: string;
    cliente_telefono: string;
    tipo_pago: "Pago por Adelantado" | "Mitad de Pago";
    total: string;
    abono: string;
    saldo: string;
    productos: BackendProductoCotizado[];
    pagado: boolean;
    entregado: boolean;
  }

  export interface ProductoCotizado {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    cantidadEntregada: number;
    color?: string;
    imagen: string;
  }

  export interface PagoPendiente {
    id: string;
    fecha: string;
    cliente: string;
    telefono: string;
    tipoPago: "pago-adelantado" | "mitad-adelanto";
    monto: number;
    saldo: number;
    productos: ProductoCotizado[];
    pagado: boolean;
    entregado: boolean;
  }

  export interface PagoRequest {
    monto: number;
    metodoPago: "efectivo" | "qr";
    idUsuario: number;
  }

  export interface EntregaRequest {
    productos: Array<{
      idvariante: number;
      cantidadEntregada: number;
    }>;
    montoPago?: number;
    metodoPago?: "efectivo" | "qr";
    idUsuario: number;
  }

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const getPagosPendientes = async (): Promise<PagoPendiente[]> => {
    try {
      const response = await api.get<BackendPagoPendiente[]>("/pagos/pendientes");
      return response.data.map((pago) => ({
        id: `COT-${pago.idcotizacion.toString().padStart(3, '0')}`,
        fecha: pago.fecha,
        cliente: pago.cliente_nombre,
        telefono: pago.cliente_telefono || "",
        tipoPago: pago.tipo_pago === "Pago por Adelantado" ? "pago-adelantado" : "mitad-adelanto",
        monto: parseFloat(pago.total),
        saldo: parseFloat(pago.saldo),
        productos: pago.productos.map((producto) => ({
          id: producto.idvariante.toString(),
          nombre: producto.nombre,
          precio: parseFloat(producto.precio_unitario),
          cantidad: producto.cantidad,
          cantidadEntregada: producto.cantidad - producto.cantidad_pendiente,
          color: producto.color_disenio || producto.color_luz || producto.watt || producto.tamano || undefined,
          imagen: producto.imagen || "/lovable-uploads/default-product.png"
        })),
        pagado: parseFloat(pago.saldo) <= 0,
        entregado: pago.productos.every(p => p.cantidad_pendiente === 0)
      }));
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      throw new Error("No se pudieron cargar los pagos pendientes");
    }
  };

  export const procesarPago = async (cotizacionId: string, pagoRequest: PagoRequest): Promise<void> => {
    try {
      const idcotizacion = parseInt(cotizacionId.replace('COT-', ''));
      await api.post(`/pagos/procesar-pago/${idcotizacion}`, pagoRequest);
    } catch (error) {
      console.error("Error processing payment:", error);
      throw new Error("No se pudo procesar el pago");
    }
  };

  export const actualizarEntregas = async (cotizacionId: string, entregaRequest: EntregaRequest): Promise<void> => {
    try {
      const idcotizacion = parseInt(cotizacionId.replace('COT-', ''));
      await api.put(`/pagos/actualizar-entregas/${idcotizacion}`, entregaRequest);
    } catch (error) {
      console.error("Error updating deliveries:", error);
      throw new Error("No se pudieron actualizar las entregas");
    }
  };

  export const marcarComoEntregado = async (cotizacionId: string): Promise<void> => {
    try {
      const idcotizacion = parseInt(cotizacionId.replace('COT-', ''));
      await api.patch(`/pagos/marcar-entregado/${idcotizacion}`);
    } catch (error) {
      console.error("Error marking as delivered:", error);
      throw new Error("No se pudo marcar como entregado");
    }
  };
  
  export const eliminarPago = async (cotizacionId: string): Promise<void> => {
  try {
    const idcotizacion = parseInt(cotizacionId.replace('COT-', ''));
    await api.delete(`/pagos/eliminar/${idcotizacion}`);
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw new Error("No se pudo eliminar el pago");
  }
};