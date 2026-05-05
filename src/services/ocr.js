import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    // Usamos el modelo en español ('spa') que reconoce S/ y formatos locales mejor
    const result = await Tesseract.recognize(imageUrl, 'spa', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log('[OCR] Progreso:', Math.round(m.progress * 100) + '%');
        }
      }
    });
    return result.data.text.replace(/\s+/g, ' ').trim();
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}