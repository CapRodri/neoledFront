import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Venta } from "@/api/VentasApi";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface GenerateVentaPDFParams {
  venta: Venta;
  nombreCliente: string;
  fileName?: string;
}

/**
 * generateVentaPDF
 * - Crea un PDF del detalle de venta que se ve exactamente igual al diálogo de impresión
 * - Retorna una Promise que se resuelve tras descargar el PDF
 */
export async function generateVentaPDF(params: GenerateVentaPDFParams): Promise<void> {
  const {
    venta,
    nombreCliente,
    fileName = `Venta_${venta.id}_${nombreCliente.replace(/\s+/g, '_')}.pdf`
  } = params;

  // 1) Crear el contenedor offscreen
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = "800px";
  wrapper.style.padding = "20px";
  wrapper.style.background = "#ffffff";
  wrapper.style.fontFamily = "Arial, sans-serif";
  wrapper.id = "venta-pdf-wrapper";

  // 2) Construir HTML idéntico al diálogo de impresión
  const fechaFormateada = format(venta.fecha, "dd/MM/yyyy HH:mm", { locale: es });

  wrapper.innerHTML = `
    <div style="max-width: 100%;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <img 
          src="/lovable-uploads/84af3e7f-9171-4c73-900f-9499a9673234.png" 
          alt="NEOLED Logo" 
          style="height: 64px; display: block; margin: 0 auto;"
          onerror="this.src='https://via.placeholder.com/160x64/f3f4f6/000000?text=NEOLED+Logo'"
        />
      </div>

      <!-- Información del cliente -->
      <div style="margin-bottom: 24px; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${escapeHtml(nombreCliente)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${escapeHtml(fechaFormateada)}</p>
        <p style="margin: 0 0 8px 0;"><strong>Dirección:</strong> Av. Heroinas esq. Hamiraya #316</p>
        <p style="margin: 0 0 8px 0;"><strong>Números:</strong> 77950297 - 77918672</p>
      </div>

      <!-- Tabla de productos y totales -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Tabla de productos -->
        <div style="flex: 1;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: bold; background-color: #f8fafc;">Producto</th>
                <th style="padding: 12px; text-align: right; font-weight: bold; background-color: #f8fafc;">Precio</th>
                <th style="padding: 12px; text-align: center; font-weight: bold; background-color: #f8fafc;">Cantidad</th>
                <th style="padding: 12px; text-align: right; font-weight: bold; background-color: #f8fafc;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${venta.detalle.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px;">${escapeHtml(item.producto)}</td>
                  <td style="padding: 12px; text-align: right;">Bs ${item.precio_unitario.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: center;">${item.cantidad}</td>
                  <td style="padding: 12px; text-align: right;">Bs ${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mini tabla de totales -->
        <div style="width: 100%; max-width: 300px; margin-left: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: 600;">Subtotal:</td>
                <td style="padding: 8px; text-align: right;">Bs ${venta.subtotal.toFixed(2)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: 600;">Descuento:</td>
                <td style="padding: 8px; text-align: right;">Bs ${venta.descuento.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: 700;">Total:</td>
                <td style="padding: 8px; text-align: right; font-weight: 700;">Bs ${venta.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pie de página -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Gracias por su preferencia - NEOLED
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  try {
    // Renderizar a canvas con html2canvas
    const node = wrapper;
    const scale = 2; // mejora calidad en pdf
    const canvas = await html2canvas(node, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
      backgroundColor: "#ffffff"
    });

    // Convertir a PDF
    const imgData = canvas.toDataURL("image/png");
    
    // Tamaño A4 en portrait
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calcular dimensiones manteniendo ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10; // margen superior

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(fileName);

  } catch (err) {
    console.error("Error generando PDF de venta:", err);
    throw err;
  } finally {
    // Limpiar el wrapper
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

/* ---------- Helper Functions ---------- */

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}