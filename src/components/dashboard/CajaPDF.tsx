// src/components/dashboard/CajaPDF.tsx
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

// Registra fuentes (puedes agregar más si necesitas)
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
    padding: 40,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2px solid #2563eb',
  },
  logoContainer: {
    width: 150,
    height: 60,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 10,
    color: '#1e293b',
    marginBottom: 5,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalCard: {
    width: '32%',
    padding: 15,
    borderRadius: 5,
    border: '1px solid #e2e8f0',
  },
  totalTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableCell: {
    fontSize: 8,
    paddingHorizontal: 3,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  movimientoType: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textAlign: 'center',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

interface TransaccionCaja {
  idtransaccion: number;
  fecha: string | Date;
  tipo_movimiento: string;
  descripcion: string;
  empleado: string;
  monto: number;
}

interface CajaPDFProps {
  movimientos: TransaccionCaja[];
  filtros: {
    fechaBusqueda?: Date;
    fechaRango?: { from?: Date; to?: Date };
    filtroEmpleado: string;
    userRole: string;
    currentUserName?: string;
  };
  totales: {
    ingresos: number;
    egresos: number;
    saldoFiltrado: number;
    saldoActual: number;
    estadoCaja: string;
  };
}

export const CajaPDF: React.FC<CajaPDFProps> = ({
  movimientos,
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

  const getTipoMovimientoColor = (tipo: string): string => {
    switch (tipo) {
      case 'Ingreso':
      case 'Apertura':
        return '#15803d';
      case 'Egreso':
        return '#dc2626';
      case 'Cierre':
        return '#1d4ed8';
      default:
        return '#6b7280';
    }
  };

  const getTipoMovimientoBgColor = (tipo: string): string => {
    switch (tipo) {
      case 'Ingreso':
      case 'Apertura':
        return '#dcfce7';
      case 'Egreso':
        return '#fee2e2';
      case 'Cierre':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  const currentDate = new Date();
  const fechaGeneracion = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;

  // Determinar título del reporte basado en filtros
  let reportTitle = 'Reporte de Caja';
  let filtroTexto = '';
  
  if (filtros.fechaBusqueda) {
    const fecha = filtros.fechaBusqueda;
    const fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    filtroTexto = `Fecha: ${fechaStr}`;
    reportTitle = `Reporte de Caja - ${fechaStr}`;
  } else if (filtros.fechaRango?.from && filtros.fechaRango?.to) {
    const from = filtros.fechaRango.from;
    const to = filtros.fechaRango.to;
    const fromStr = `${from.getDate()}/${from.getMonth() + 1}/${from.getFullYear()}`;
    const toStr = `${to.getDate()}/${to.getMonth() + 1}/${to.getFullYear()}`;
    filtroTexto = `Rango: ${fromStr} - ${toStr}`;
    reportTitle = `Reporte de Caja - ${fromStr} a ${toStr}`;
  }
  
  if (filtros.filtroEmpleado !== 'Todos') {
    filtroTexto += filtroTexto ? ` | Empleado: ${filtros.filtroEmpleado}` : `Empleado: ${filtros.filtroEmpleado}`;
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
          <View>
            <Text style={styles.title}>Reporte de Caja</Text>
            <Text style={styles.subtitle}>Sistema de Gestión</Text>
          </View>
          <View style={{ width: 150 }} />
        </View>

        {/* Información del Reporte */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>FECHA DE GENERACIÓN</Text>
            <Text style={styles.infoText}>{fechaGeneracion}</Text>
            
            <Text style={styles.infoTitle}>FILTROS APLICADOS</Text>
            <Text style={styles.infoText}>
              {filtroTexto || 'Todos los movimientos'}
            </Text>
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalCard}>
            <Text style={styles.totalTitle}>TOTAL EGRESOS</Text>
            <Text style={[styles.totalAmount, { color: '#dc2626' }]}>
              {formatCurrency(totales.egresos)}
            </Text>
            <Text style={[styles.infoText, { fontSize: 8 }]}>En los movimientos mostrados</Text>
          </View>
          
          <View style={styles.totalCard}>
            <Text style={styles.totalTitle}>TOTAL INGRESOS</Text>
            <Text style={[styles.totalAmount, { color: '#16a34a' }]}>
              {formatCurrency(totales.ingresos)}
            </Text>
            <Text style={[styles.infoText, { fontSize: 8 }]}>En los movimientos mostrados</Text>
          </View>
          
          <View style={styles.totalCard}>
            <Text style={styles.totalTitle}>SALDO MOSTRADO</Text>
            <Text style={[styles.totalAmount, { color: totales.saldoFiltrado >= 0 ? '#16a34a' : '#dc2626' }]}>
              {formatCurrency(totales.saldoFiltrado)}
            </Text>
            <Text style={[styles.infoText, { fontSize: 8 }]}>
              Saldo actual: {formatCurrency(totales.saldoActual)}
            </Text>
          </View>
        </View>

        {/* Tabla de Movimientos */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#1e293b' }}>
            Detalle de Movimientos
          </Text>
          
          <View style={styles.table}>
            {/* Encabezados de la tabla */}
            <View style={styles.tableHeader}>
              <View style={{ width: '10%' }}>
                <Text style={styles.tableCellHeader}>#</Text>
              </View>
              <View style={{ width: '15%' }}>
                <Text style={styles.tableCellHeader}>FECHA</Text>
              </View>
              <View style={{ width: '15%' }}>
                <Text style={styles.tableCellHeader}>TIPO</Text>
              </View>
              <View style={{ width: '30%' }}>
                <Text style={styles.tableCellHeader}>DESCRIPCIÓN</Text>
              </View>
              {filtros.userRole === 'Admin' && (
                <View style={{ width: '15%' }}>
                  <Text style={styles.tableCellHeader}>EMPLEADO</Text>
                </View>
              )}
              <View style={{ width: filtros.userRole === 'Admin' ? '15%' : '30%' }}>
                <Text style={styles.tableCellHeader}>MONTO</Text>
              </View>
            </View>

            {/* Filas de la tabla */}
            {movimientos.map((mov, index) => (
              <View key={mov.idtransaccion} style={styles.tableRow}>
                <View style={{ width: '10%' }}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={{ width: '15%' }}>
                  <Text style={styles.tableCell}>{formatDate(mov.fecha)}</Text>
                </View>
                <View style={{ width: '15%' }}>
                  <View
                    style={[
                      styles.movimientoType,
                      {
                        backgroundColor: getTipoMovimientoBgColor(mov.tipo_movimiento),
                        color: getTipoMovimientoColor(mov.tipo_movimiento),
                      },
                    ]}
                  >
                    <Text>{mov.tipo_movimiento}</Text>
                  </View>
                </View>
                <View style={{ width: '30%' }}>
                  <Text style={styles.tableCell}>{mov.descripcion}</Text>
                </View>
                {filtros.userRole === 'Admin' && (
                  <View style={{ width: '15%' }}>
                    <Text style={styles.tableCell}>{mov.empleado}</Text>
                  </View>
                )}
                <View style={{ width: filtros.userRole === 'Admin' ? '15%' : '30%' }}>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        color: getTipoMovimientoColor(mov.tipo_movimiento),
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {mov.tipo_movimiento === 'Egreso' ? '-' : ''}{formatCurrency(mov.monto)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Sistema de Gestión de Caja | Reporte generado automáticamente
          </Text>
          <Text style={{ marginTop: 5 }}>
            {filtros.userRole === 'Admin' 
              ? 'Administrador' 
              : `Usuario: ${filtros.currentUserName || 'Usuario'}`}
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