import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromImage } from './ocr.js'; // Traemos tu motor OCR local

// Configuramos el worker de PDF.js para Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // 1. Intentamos leer el texto digital
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  const cleanText = fullText.replace(/\s+/g, ' ').trim();
  
  // Si encontramos suficiente texto digital, lo devolvemos directo (Súper rápido)
  if (cleanText.length > 50) {
    return cleanText;
  }
  
  // 2. SI EL PDF ESTÁ VACÍO (Es un PDF Escaneado)
  console.log('[PDF] No se detectó texto digital. Renderizando PDF a imagen para usar OCR local...');
  
  // Tomamos la primera página del PDF
  const page = await pdf.getPage(1); 
  // La escalamos x2.0 para que la imagen tenga alta resolución y el OCR no falle
  const viewport = page.getViewport({ scale: 2.0 }); 
  
  // Creamos un lienzo (canvas) en la memoria del navegador
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // "Pintamos" el PDF en el lienzo
  await page.render({ canvasContext: context, viewport: viewport }).promise;
  
  // Convertimos el lienzo en un archivo de imagen (PNG)
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const imageFile = new File([blob], "scanned_page.png", { type: "image/png" });
  
  // Le enviamos la imagen a tu motor OCR local para que haga la magia
  return await extractTextFromImage(imageFile);
}