import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a DOM element as a PNG image
 */
export async function exportElementAsImage(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    // Wait for any images to load? 
    // html2canvas usually handles this with useCORS, but sometimes a small delay helps with rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution for retina displays
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      backgroundColor: '#ffffff', // Ensure white background
      ignoreElements: (node: Element) => {
        // Ignore elements with class 'no-export'
        return node.classList?.contains('no-export');
      }
    } as any);

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export to PNG failed:', error);
    throw error;
  }
}

/**
 * Exports a DOM element as a PDF
 */
export async function exportElementAsPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (node: Element) => {
        return node.classList?.contains('no-export');
      }
    } as any);

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm (portrait)
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate dimensions to fit width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // If image fits on one page
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page logic
      let heightLeft = imgHeight;
      let position = 0;
      let page = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // This logic is usually position -= 297 ? 
        // Actually for jspdf addImage, y coordinate.
        // We need to shift the image up.
        // Page 1: y=0
        // Page 2: y=-297
        
        pdf.addPage();
        position = -(pdfHeight * (page + 1)); // This is tricky with single image. 
        // Better approach:
        // We are just adding the same image shifted up.
        // position should be negative.
        
        // Simple approach: just one page if not critical, but user might want full content.
        // Let's try the negative offset approach.
        pdf.addImage(imgData, 'PNG', 0, -(pdfHeight * (page + 1)), imgWidth, imgHeight);
        
        heightLeft -= pdfHeight;
        page++;
      }
    }
    
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Export to PDF failed:', error);
    throw error;
  }
}
