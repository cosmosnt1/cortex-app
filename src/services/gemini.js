import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_ID = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-1.5-flash-latest';

const TC_ALLOWED = new Set(['01', '02', '03', '-']);

const EXTRACTION_PROMPT = `Eres un extractor fiscal para comprobantes peruanos destinados al informe DAFO.
REGLAS ESTRICTAS:
- Solo extrae datos que puedas leer claramente en el documento. Nunca inventes ni completes por suposición.
- Si un campo no aparece o es ilegible, devuélvelo como null (JSON null), salvo donde se indique otro valor por defecto.
- Salida: UN SOLO objeto JSON válido, sin markdown, sin texto antes ni después.

Campos y formato:

1) fecha: string YYYY-MM-DD de la fecha de emisión si es visible; si no, null.

2) tipoComprobante: string OBLIGATORIO. Clasificación estricta según el texto del documento:
   - Si indica "Factura" o "Factura Electrónica" → devuelve exactamente "01".
   - Si indica "Recibo por Honorarios", "Recibo por Honorario Electrónico" o "RHE" → devuelve exactamente "02".
   - Si indica "Boleta" o "Boleta de Venta" → devuelve exactamente "03".
   - Para cualquier otro tipo (ticket, proforma, nota de venta no boleta, etc.) → devuelve exactamente "-".

3) numeroComprobante: serie y correlativo tal como en el documento (ej. "F003-00003217"). Si no está claro, null.

4) proveedor: razón social completa del emisor; si no, null.

5) ruc: string con exactamente 11 dígitos del RUC del emisor (solo dígitos); si no hay RUC claro, null.

6) itemDetalle: detalle del gasto / descripción principal legible; si no, null.

7) moneda: solo "PEN" o "USD" según el documento (S/ o soles → PEN; símbolo de dólar o texto USD → USD). Si no está claro, null.

8) tipoCambio: número decimal (double) del tipo de cambio del día SI aparece explícitamente en el documento Y la moneda es USD. Si la moneda es PEN, devuelve siempre null. Si es USD pero no hay tipo de cambio visible, null.

9) montoTotal: número decimal del importe total a pagar / total del comprobante; si no está claro, null.

Esquema EXACTO del JSON (solo estas claves):
{"fecha": string|null,"tipoComprobante": string,"numeroComprobante": string|null,"proveedor": string|null,"ruc": string|null,"itemDetalle": string|null,"moneda": string|null,"tipoCambio": number|null,"montoTotal": number|null}

Analiza el comprobante adjunto y responde únicamente con ese JSON.`;

export function isGeminiConfigured() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return Boolean(key && String(key).trim());
}

function stripJsonFence(text) {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  }
  return t.trim();
}

function coerceNumber(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeTipoComprobante(value) {
  const s = String(value ?? '').trim();
  return TC_ALLOWED.has(s) ? s : '-';
}

export function normalizeInvoiceExtraction(raw) {
  if (!raw || typeof raw !== 'object') {
    return emptyExtraction();
  }
  const fecha =
    typeof raw.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.fecha.trim())
      ? raw.fecha.trim()
      : '';
  const tipoComprobante = normalizeTipoComprobante(raw.tipoComprobante);
  const numeroComprobante =
    typeof raw.numeroComprobante === 'string'
      ? raw.numeroComprobante.trim()
      : '';
  const proveedor =
    typeof raw.proveedor === 'string' ? raw.proveedor.trim() : '';
  let ruc = '';
  if (raw.ruc != null) {
    ruc = String(raw.ruc).replace(/\D/g, '').slice(0, 11);
  }
  const itemDetalle =
    typeof raw.itemDetalle === 'string' ? raw.itemDetalle.trim() : '';

  let moneda = 'PEN';
  if (typeof raw.moneda === 'string' && raw.moneda.trim()) {
    const u = raw.moneda.trim().toUpperCase();
    moneda = u === 'USD' ? 'USD' : 'PEN';
  }

  let tipoCambio = coerceNumber(raw.tipoCambio);
  if (moneda !== 'USD') {
    tipoCambio = null;
  }

  const montoTotal = coerceNumber(raw.montoTotal);

  return {
    fecha,
    tipoComprobante,
    numeroComprobante,
    proveedor,
    ruc,
    itemDetalle,
    moneda,
    tipoCambio,
    montoTotal,
  };
}

function emptyExtraction() {
  return {
    fecha: '',
    tipoComprobante: '-',
    numeroComprobante: '',
    proveedor: '',
    ruc: '',
    itemDetalle: '',
    moneda: 'PEN',
    tipoCambio: null,
    montoTotal: null,
  };
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }
      const comma = result.indexOf(',');
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Lectura abortada.'));
    reader.readAsDataURL(file);
  });
}

function mimeForFile(file) {
  const t = file.type?.trim();
  if (t && t !== 'application/octet-stream') return t;
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

/**
 * Extrae datos estructurados de un PDF o imagen de comprobante.
 * @param {File} file
 * @returns {Promise<ReturnType<normalizeInvoiceExtraction>>}
 */
export async function extractInvoiceData(file) {
  if (!isGeminiConfigured()) {
    throw new Error(
      'Falta VITE_GEMINI_API_KEY en .env (clave de Google AI Studio).',
    );
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const mimeType = mimeForFile(file);
  const allowed =
    mimeType === 'application/pdf' ||
    mimeType.startsWith('image/jpeg') ||
    mimeType.startsWith('image/png') ||
    mimeType === 'image/webp';

  if (!allowed) {
    throw new Error(
      'Formato no soportado. Usa PDF, JPG, PNG o WEBP (máx. según cuota de Gemini).',
    );
  }

  const base64 = await readFileAsBase64(file);

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const response = result.response;
  const text = response.text();
  let parsed;
  try {
    parsed = JSON.parse(stripJsonFence(text));
  } catch {
    throw new Error(
      'La respuesta del modelo no es JSON válido. Intenta con otra imagen o calidad.',
    );
  }

  return normalizeInvoiceExtraction(parsed);
}
