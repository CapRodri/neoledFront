// src/components/dashboard/VentasTablaPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Registra fuentes
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Define estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottom: '2px solid #2563eb',
  },
  logoContainer: {
    width: 120,
    height: 50,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    border: '1px solid #e2e8f0',
  },
  infoColumn: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 9,
    color: '#1e293b',
    marginBottom: 4,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalCard: {
    width: '32%',
    padding: 12,
    borderRadius: 5,
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  totalTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 7,
    paddingHorizontal: 2,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 2,
  },
  metodoBadge: {
    fontSize: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 4,
  },
});

interface Venta {
  id: number;
  fecha: string | Date;
  usuario: string;
  descripcion: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo: string;
  detalle?: Array<{
    producto: string;
    cantidad: number;
    precio_unitario: number;
  }>;
}

interface VentasTablaPDFProps {
  ventas: Venta[];
  filtros: {
    fechaBusqueda?: Date;
    fechaRango?: { from?: Date; to?: Date };
    filtroEmpleado: string;
    filtroMetodo: string;
    empleadosOptions: Array<{ value: string; label: string; username: string }>;
    userRole: string;
    currentUserName?: string;
  };
  totales: {
    totalGeneral: number;
    totalEfectivo: number;
    totalQR: number;
  };
}

export const VentasTablaPDF: React.FC<VentasTablaPDFProps> = ({
  ventas,
  filtros,
  totales,
}) => {
  const formatDate = (dateInput: string | Date): string => {
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedHours = hours < 10 ? `0${hours}` : hours.toString();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
      
      return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes}`;
    } catch {
      return typeof dateInput === 'string' ? dateInput.substring(0, 10) : 'Fecha inválida';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `Bs ${amount.toFixed(2)}`;
  };

  const currentDate = new Date();
  const fechaGeneracion = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;

  // Determinar título del reporte basado en filtros
  let filtroTexto = '';
  
  if (filtros.fechaBusqueda) {
    const fecha = filtros.fechaBusqueda;
    const fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    filtroTexto = `Fecha: ${fechaStr}`;
  } else if (filtros.fechaRango?.from && filtros.fechaRango?.to) {
    const from = filtros.fechaRango.from;
    const to = filtros.fechaRango.to;
    const fromStr = `${from.getDate()}/${from.getMonth() + 1}/${from.getFullYear()}`;
    const toStr = `${to.getDate()}/${to.getMonth() + 1}/${to.getFullYear()}`;
    filtroTexto = `Rango: ${fromStr} - ${toStr}`;
  }
  
  if (filtros.filtroEmpleado !== "Todos") {
    const empleadoLabel = filtros.empleadosOptions.find(e => e.value === filtros.filtroEmpleado)?.label || filtros.filtroEmpleado;
    filtroTexto += filtroTexto ? ` | Empleado: ${empleadoLabel}` : `Empleado: ${empleadoLabel}`;
  }
  
  if (filtros.filtroMetodo !== "Todos") {
    filtroTexto += filtroTexto ? ` | Método: ${filtros.filtroMetodo}` : `Método: ${filtros.filtroMetodo}`;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              src="/lovable-uploads/84af3e7f-9171-4c73-900f-9499a9673234.png"
              style={styles.logo}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reporte de Ventas</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Comercial</Text>
          </View>
          <View style={{ width: 120 }} />
        </View>

        {/* Información del Reporte */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>FECHA DE GENERACIÓN</Text>
            <Text style={styles.infoText}>{fechaGeneracion}</Text>
            
            <Text style={styles.infoTitle}>FILTROS APLICADOS</Text>
            <Text style={styles.infoText}>
              {filtroTexto || 'Ventas de hoy'}
            </Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>TOTAL REGISTROS</Text>
            <Text style={styles.infoText}>{ventas.length} ventas</Text>
            
            <Text style={styles.infoTitle}>GENERADO POR</Text>
            <Text style={styles.infoText}>
              {filtros.userRole === 'Admin' 
                ? 'Administrador' 
                : `Usuario: ${filtros.currentUserName || 'Usuario'}`}
            </Text>
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={[styles.totalCard, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
            <Text style={styles.totalTitle}>TOTAL GENERAL</Text>
            <Text style={[styles.totalAmount, { color: '#1e40af' }]}>
              {formatCurrency(totales.totalGeneral)}
            </Text>
          </View>
          
          <View style={[styles.totalCard, { borderLeftColor: '#10b981', borderLeftWidth: 4 }]}>
            <Text style={styles.totalTitle}>TOTAL EFECTIVO</Text>
            <Text style={[styles.totalAmount, { color: '#059669' }]}>
              {formatCurrency(totales.totalEfectivo)}
            </Text>
          </View>
          
          <View style={[styles.totalCard, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
            <Text style={styles.totalTitle}>TOTAL QR</Text>
            <Text style={[styles.totalAmount, { color: '#2563eb' }]}>
              {formatCurrency(totales.totalQR)}
            </Text>
          </View>
        </View>

        {/* Tabla de Ventas */}
        <View style={{ marginTop: 15 }}>
          <Text style={styles.sectionTitle}>
            Detalle de Ventas ({ventas.length} registros)
          </Text>
          
          <View style={styles.table}>
            {/* Encabezados de la tabla */}
            <View style={styles.tableHeader}>
              <View style={{ width: '10%' }}>
                <Text style={styles.tableCellHeader}>#</Text>
              </View>
              <View style={{ width: '13%' }}>
                <Text style={styles.tableCellHeader}>FECHA</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={styles.tableCellHeader}>HORA</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={styles.tableCellHeader}>USUARIO</Text>
              </View>
              <View style={{ width: '25%' }}>
                <Text style={styles.tableCellHeader}>DESCRIPCIÓN</Text>
              </View>
              <View style={{ width: '8%' }}>
                <Text style={styles.tableCellHeader}>SUBTOTAL</Text>
              </View>
              <View style={{ width: '8%' }}>
                <Text style={styles.tableCellHeader}>DESC.</Text>
              </View>
              <View style={{ width: '8%' }}>
                <Text style={styles.tableCellHeader}>TOTAL</Text>
              </View>
              <View style={{ width: '7%' }}>
                <Text style={styles.tableCellHeader}>MÉTODO</Text>
              </View>
            </View>

            {/* Filas de la tabla */}
            {ventas.map((venta, index) => {
              const fecha = new Date(venta.fecha);
              const horaStr = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
              const fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
              
              return (
                <View key={venta.id} style={styles.tableRow}>
                  {/* Número */}
                  <View style={{ width: '10%' }}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  
                  {/* Fecha */}
                  <View style={{ width: '13%' }}>
                    <Text style={styles.tableCell}>{fechaStr}</Text>
                  </View>
                  
                  {/* Hora */}
                  <View style={{ width: '12%' }}>
                    <Text style={styles.tableCell}>{horaStr}</Text>
                  </View>
                  
                  {/* Usuario */}
                  <View style={{ width: '12%' }}>
                    <Text style={styles.tableCell}>{venta.usuario}</Text>
                  </View>
                  
                  {/* Descripción */}
                  <View style={{ width: '25%' }}>
                    <Text style={styles.tableCell}>{venta.descripcion}</Text>
                  </View>
                  
                  {/* Subtotal */}
                  <View style={{ width: '8%' }}>
                    <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                      {formatCurrency(venta.subtotal)}
                    </Text>
                  </View>
                  
                  {/* Descuento */}
                  <View style={{ width: '8%' }}>
                    <Text style={[styles.tableCell, { textAlign: 'right', color: '#dc2626' }]}>
                      {formatCurrency(venta.descuento)}
                    </Text>
                  </View>
                  
                  {/* Total */}
                  <View style={{ width: '8%' }}>
                    <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }]}>
                      {formatCurrency(venta.total)}
                    </Text>
                  </View>
                  
                  {/* Método */}
                  <View style={{ width: '7%' }}>
                    <View
                      style={[
                        styles.metodoBadge,
                        {
                          backgroundColor: venta.metodo === 'Efectivo' ? '#dcfce7' : '#dbeafe',
                          color: venta.metodo === 'Efectivo' ? '#166534' : '#1e40af',
                        },
                      ]}
                    >
                      <Text>{venta.metodo === 'Efectivo' ? 'EF' : 'QR'}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Sistema de Gestión de Ventas | Reporte generado automáticamente
          </Text>
        </View>

        {/* Número de página */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};