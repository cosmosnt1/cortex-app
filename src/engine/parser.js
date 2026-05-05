/**
 * Función Helper: Convierte "HOLA MUNDO" a "Hola Mundo"
 * pero respeta las siglas como S.A.C., EIRL, etc.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(/\s+/).map(word => {
    // 🔥 SOLUCIÓN: Agregamos \.? para hacer que los puntos sean opcionales
    if (/^(s\.?a\.?c\.?|e\.?i\.?r\.?l\.?|s\.?a\.?|s\.?r\.?l\.?|jr\.?|av\.?|cal\.?|oz|ruc|rhe)$/i.test(word)) {
      return word.toUpperCase();
    }
    if (/^(y|de|del|el|la|los|las|en)$/i.test(word)) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ').trim();
}

/**
 * FASE 3: PARSER DETERMINÍSTICO (Inteligencia SUNAT + Prioridad Superior)
 */
export function parseInvoice(rawText) {
  const text = rawText.toUpperCase();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const textSinEspacios = text.replace(/[\s-]/g, '');
  
  const result = {
    tipoComprobante: '-', ruc: '', proveedor: '', numeroComprobante: '',
    fecha: '', moneda: 'PEN', montoTotal: '', itemDetalle: ''
  };

  // 1. RUC
  const rucMatch = textSinEspacios.match(/(10|20)\d{9}/);
  if (rucMatch) result.ruc = rucMatch[0];

  // 2. TIPO COMPROBANTE
  if (/FACTURA/i.test(text)) result.tipoComprobante = '01';
  else if (/HONORARIO|RHE/i.test(text)) result.tipoComprobante = '02';
  else if (/BOLETA/i.test(text)) result.tipoComprobante = '03';

  // 3. NÚMERO
  const numMatch = text.match(/\b[FBE0-9][A-Z0-9]{3}\s*[-_]\s*\d{4,8}\b/);
  if (numMatch) result.numeroComprobante = numMatch[0].replace(/\s+/g, '');

  // 4. FECHA
  const dateMatches = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/g);
  if (dateMatches && dateMatches.length > 0) {
    const firstDate = dateMatches[0].match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
    const day = firstDate[1].padStart(2, '0');
    const month = firstDate[2].padStart(2, '0');
    result.fecha = `${firstDate[3]}-${month}-${day}`;
  }

  // 5. MONEDA
  if (/(USD|DOLARES|DÓLARES|\$)/.test(text) && !/S\//.test(text)) result.moneda = 'USD';

  // 6. TOTAL
  const totalMatch = text.match(/TOTAL[\s\S]{0,15}?(?:S\/\.|S\/|\$)?\s*(\d+[\.,]\d{2})\b/);
  if (totalMatch) {
    result.montoTotal = totalMatch[1].replace(',', '.');
  } else {
    const decimalMatches = text.match(/\d+[\.,]\d{2}\b/g);
    if (decimalMatches) {
      const numbers = decimalMatches.map(n => parseFloat(n.replace(',', '.')));
      result.montoTotal = String(Math.max(...numbers));
    }
  }

  // 7. PROVEEDOR
  const stopKeywords = ['CLIENTE', 'RAZON SOCIAL', 'RAZ SOC', 'ADQUIRIENTE', 'USUARIO', 'DOMICILIO'];
  const siglaRegex = /\b([A-Z0-9\s'&ÑÁÉÍÓÚ]+)\s+(S\.?A\.?C\.?|S\.?A\.?|E\.?I\.?R\.?L\.?|S\.?R\.?L\.?)\b/i;

  let potentialCompanies = [];
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (stopKeywords.some(k => line.includes(k))) continue;

    const match = line.match(siglaRegex);
    if (match) {
      const name = match[0].trim();
      if (!name.toUpperCase().includes('NEPTUNO FILMS')) {
        potentialCompanies.push(name);
      }
    }
  }

  if (potentialCompanies.length > 0) {
    result.proveedor = toTitleCase(potentialCompanies[0]);
  }

  if (!result.proveedor && result.ruc) {
    const rucLineIndex = lines.findIndex(l => l.replace(/[\s-]/g, '').includes(result.ruc));
    if (rucLineIndex !== -1) {
      let nameLine = lines[rucLineIndex].replace(/RUC|:|10\d{9}|20\d{9}/g, '').trim();
      if (nameLine.length < 5 && rucLineIndex > 0) nameLine = lines[rucLineIndex - 1];
      if (nameLine.length > 5 && !nameLine.toUpperCase().includes('NEPTUNO FILMS')) {
        result.proveedor = toTitleCase(nameLine.substring(0, 50).replace(/[^A-ZÑÁÉÍÓÚ\s]/g, '').trim());
      }
    }
  }

  // 8. DETALLE DEL GASTO
  let startItemIndex = -1;
  let endItemIndex = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (startItemIndex === -1 && (l.includes('ITEM') || l.includes('DESCRIPCION') || l.includes('CANT') || l.includes('UNTI'))) {
      startItemIndex = l.length > 15 ? i : i + 1; 
    }
    if (startItemIndex !== -1 && i >= startItemIndex && (l.includes('TOTAL') || l.includes('IGV') || l.includes('GRAVADA') || l.includes('SUBTOTAL') || l.includes('OP.'))) {
      if (i !== startItemIndex || l.length < 25) {
          endItemIndex = i;
          break;
      }
    }
  }

  if (startItemIndex !== -1 && startItemIndex < endItemIndex) {
    const cleanedItems = lines.slice(startItemIndex, endItemIndex)
      .map(l => {
        let clean = l;
        clean = clean.replace(/^\s*\d+([\.,]\d+)?\s+/, ''); 
        clean = clean.replace(/\bUNTI\b/gi, ''); 
        clean = clean.replace(/(\s+(?:S\/\.?|\$)?\s*\d+[\.,]\d{2})+\s*$/, ''); 
        return clean.trim();
      })
      .filter(l => l.length > 3 && !/^(CANT|ITEM|DESCRIPCION|TOTAL|P\.UNIT|IMPORTE|UNTI)/i.test(l));

    result.itemDetalle = toTitleCase(cleanedItems.join(', ').substring(0, 100));
  }

  return result;
}

export function calculateConfidence(data) {
  let score = 0;
  if (data.ruc) score += 0.3; 
  if (data.tipoComprobante !== '-') score += 0.2;
  if (data.numeroComprobante) score += 0.2;
  if (data.fecha) score += 0.1;
  if (data.montoTotal) score += 0.2;
  return score;
}