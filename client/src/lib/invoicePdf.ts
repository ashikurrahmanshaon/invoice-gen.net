import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function createInvoicePdf(element: HTMLElement) {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = 190;
  const height = (canvas.height * width) / canvas.width;
  let heightLeft = height;
  let position = 10;
  pdf.addImage(image, "PNG", 10, position, width, height, undefined, "FAST");
  heightLeft -= 277;
  while (heightLeft > 0) {
    position = heightLeft - height + 10;
    pdf.addPage();
    pdf.addImage(image, "PNG", 10, position, width, height, undefined, "FAST");
    heightLeft -= 277;
  }
  return pdf;
}
