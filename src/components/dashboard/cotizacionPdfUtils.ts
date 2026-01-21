// cotizacionPdfUtils.ts
// Tipos y un ejemplo de wrapper para llamar fácilmente a generateCotizacionPDF desde tu CotizacionView.

import { generateCotizacionPDF, CotizacionItemPDF, DatosClientePDF } from "./CotizacionPDF";

/**
 * Descarga la cotización en PDF con los datos que ya tienes en CotizacionView.
 * Llama a esta función y pásale los datos.
 */
export async function downloadCotizacionAsPDF(args: {
  datosCliente: DatosClientePDF;
  items: CotizacionItemPDF[];
  subtotal: number;
  descuentoTotal: number;
  totalFinal: number;
  fecha?: string;
  logoUrl?: string;
  fileName?: string;
}) {
  const { datosCliente, items, subtotal, descuentoTotal, totalFinal, fecha, logoUrl, fileName } = args;

  // Pasar todos los items directamente, incluyendo productoNombre y nombre_variante
  await generateCotizacionPDF({
    datosCliente,
    items: items, // Pasar todos los items con todos sus campos
    subtotal,
    descuentoTotal,
    totalFinal,
    fecha,
    logoUrl,
    fileName
  });
}