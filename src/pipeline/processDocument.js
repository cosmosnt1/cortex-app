import { extractInvoiceData } from '../services/gemini.js';
import { extractTextFromPdf } from '../services/pdf.js';
import { extractTextFromImage } from '../services/ocr.js';
import { parseInvoice, calculateConfidence } from '../engine/parser.js';
import { applyMemoryToData } from '../memory/storage.js'; 
// 🚨 NOTA: Quitamos saveToMemory de los imports de arriba porque ya no debe estar aquí.

async function extractText(file) {
  const mime = file.type;
  if (mime === 'application/pdf') {
    console.log('[Pipeline] 📄 PDF detectado.');
    return await extractTextFromPdf(file);
  } else if (mime.startsWith('image/')) {
    console.log('[Pipeline] 🖼️ Imagen detectada. Iniciando OCR...');
    return await extractTextFromImage(file);
  }
  throw new Error('Formato no soportado para extracción.');
}

export async function processDocument(file) {
  console.log('[Pipeline] ⚡ Iniciando procesamiento de documento...');
  
  try {
    const rawText = await extractText(file);
    let data = parseInvoice(rawText);
    
    // 🧠 APLICAMOS MEMORIA ANTES DE EVALUAR
    data = applyMemoryToData(data, rawText);
    
    const confidence = calculateConfidence(data);
    console.log(`[Pipeline] 📊 Score de confianza: ${Math.round(confidence * 100)}%`);
    
    if (confidence < 0.7) {
      console.warn('[Pipeline] ⚠️ Confianza baja. Activando Fallback a Gemini...');
      const geminiData = await extractInvoiceData(file);
      // Hacemos merge priorizando lo que encontró Gemini, pero manteniendo lo que ya teníamos
      data = { ...data, ...geminiData };
    } else {
      console.log('[Pipeline] 🎯 ¡Confianza alta! IA omitida. Dinero ahorrado 💸');
    }

    // 🛡️ FILTRO ANTI-NEPTUNO (Tu propia empresa)
    // Si en algún punto el OCR, la memoria o Gemini atraparon a tu empresa, lo borramos.
    if (data.proveedor && data.proveedor.toUpperCase().includes('NEPTUNO FILMS')) {
      console.warn('[Pipeline] 🛡️ Se detectó a NEPTUNO FILMS como proveedor. Borrando falso positivo...');
      data.proveedor = '';
    }

    // ❌ ELIMINAMOS el saveToMemory(data) de aquí.
    // El entrenamiento solo debe ocurrir en ExtractionDrawer.jsx cuando le das a "Confirmar Liquidación".

    return data;
  } catch (err) {
    console.error('[Pipeline Error]', err);
    let fallbackData = await extractInvoiceData(file);
    
    // Filtro Anti-Neptuno también para el error catastrófico
    if (fallbackData.proveedor && fallbackData.proveedor.toUpperCase().includes('NEPTUNO FILMS')) {
        fallbackData.proveedor = '';
    }
    
    return fallbackData;
  }
}