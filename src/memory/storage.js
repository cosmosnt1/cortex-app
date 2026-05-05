// Guardamos lo que el sistema (o Gemini) detectó correctamente
export function saveToMemory(data) {
    if (!data.ruc || !data.proveedor || data.ruc.length !== 11) return;
    const memory = JSON.parse(localStorage.getItem('cortex_providers') || '{}');
    
    // Guardamos el proveedor asociado al RUC
    memory[data.ruc] = data.proveedor;
    localStorage.setItem('cortex_providers', JSON.stringify(memory));
  }
  
  // Rescatamos datos usando el historial
  export function applyMemoryToData(data, rawText) {
    const memory = JSON.parse(localStorage.getItem('cortex_providers') || '{}');
    const upperText = rawText.toUpperCase();
    
    // Caso 1: El OCR vio el RUC, pero no entendió el nombre de la empresa
    if (data.ruc && memory[data.ruc] && !data.proveedor) {
      data.proveedor = memory[data.ruc];
      console.log('[Memoria] 🧠 Proveedor recuperado a través del RUC.');
    }
    
    // Caso 2: El OCR NO vio el RUC (documento borroso), pero leyó el nombre de la empresa
    if (!data.ruc) {
      for (const [ruc, proveedor] of Object.entries(memory)) {
        if (proveedor.length > 5 && upperText.includes(proveedor.toUpperCase())) {
          data.ruc = ruc;
          data.proveedor = proveedor;
          console.log('[Memoria] 🧠 ¡Coincidencia histórica de texto! Autocompletando RUC y Proveedor.');
          break;
        }
      }
    }
    return data;
  }