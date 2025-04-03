import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ReportItem } from "@/types";

/**
 * Generate a PDF report from farm inventory data
 * @param title Title of the report
 * @param dateRange Date range string
 * @param reportData Array of report items
 */
export async function generatePDF(
  title: string,
  dateRange: string,
  reportData: ReportItem[]
) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date range
  doc.setFontSize(12);
  doc.text(`Date Range: ${dateRange}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  
  // Add inventory changes table
  doc.setFontSize(14);
  doc.text("Inventory Changes", 14, 46);
  
  // Use the autotable plugin to create inventory table
  (doc as any).autoTable({
    startY: 50,
    head: [['Product', 'Starting', 'Added', 'Removed', 'Current']],
    body: reportData.map(item => [
      item.name,
      `${item.starting} ${item.unit}`,
      item.added > 0 ? `+${item.added}` : "0",
      item.removed > 0 ? `-${item.removed}` : "0",
      `${item.current} ${item.unit}`
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [46, 125, 50],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Low stock table
  const lowStockItems = reportData.filter(item => item.isLowStock);
  
  if (lowStockItems.length > 0) {
    doc.setFontSize(14);
    const lowStockY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Low Stock Alert", 14, lowStockY);
    
    (doc as any).autoTable({
      startY: lowStockY + 4,
      head: [['Product', 'Field Location', 'Current Stock', 'Status']],
      body: lowStockItems.map(item => [
        item.name,
        item.fieldLocation,
        `${item.current} ${item.unit}`,
        item.isCriticalStock ? 'Critical Stock' : 'Low Stock'
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [255, 160, 0],
        textColor: 0,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        3: {
          fontStyle: 'bold',
          textColor: (data: any) => {
            if (data.cell.raw === 'Critical Stock') {
              return [229, 57, 53]; // Red
            }
            return [255, 160, 0]; // Yellow
          }
        }
      }
    });
  }
  
  // Add farm name in footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Farm Management System",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Save the PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
