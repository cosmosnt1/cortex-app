---
title: PRD — Motor Híbrido de Extracción de Comprobantes (Perú)
type: technical_specification
status: draft
version: 1.0.0
---

# 🧠 PRD — Motor Híbrido de Extracción de Comprobantes (Perú)

(Versión extendida con integración en app existente)

---

## 🎯 1. Visión del Producto

Construir un motor inteligente capaz de:

- `procesar_comprobantes` (facturas, boletas, RHE)
- `extraer_datos_estructurados` automáticamente
- `aprender_documentos` anteriores
- `minimizar_uso_ia` (solo fallback)
- `integracion_modular` dentro de una web app existente (Vite)

---

## 👤 2. Usuario objetivo

- `productores_audiovisuales` (DAFO)
- `contadores_independientes`
- `pymes`

---

## 🧩 3. Problema

- `alto_volumen_comprobantes` (~800 por proyecto)
- `formatos_variables`
- `procesamiento_manual_lento`
- `ia_costosa_escala`

---

## ✅ 4. Solución

Sistema híbrido con:

- `extraccion_deterministica` (OCR + parser)
- `memoria_patrones` por proveedor
- `ia_fallback_inteligente`
- `integracion_modular` dentro de app existente

---

## 🏗️ 5. ARQUITECTURA DEL SISTEMA

---

### 5.1 Módulo: Ingesta

- `input`: PDF / imagen
- `detecta_tipo_archivo`
- `decide_flujo` (OCR vs texto directo)

---

### 5.2 Módulo: Extracción de texto

    IF PDF digital -> usar pdf.js
    IF Escaneados / imágenes -> usar Tesseract OCR

---

### 5.3 Módulo: Parser determinístico

Extrae los siguientes campos:

- `tipoComprobante`
- `ruc`
- `proveedor`
- `numero`
- `fecha`
- `moneda`
- `total`

**Basado en:**

- `regex`
- `reglas_semanticas`
- `keywords`

---

### 5.4 Módulo: Memoria (aprendizaje)

Guarda la siguiente información:

- `proveedor`
- `patrones_detectados`
- `regex_utiles`
- `estructura_documento`
- `historial_uso`
- `nivel_confianza`

---

### 5.5 Módulo: Score de confianza

Evalúa los siguientes criterios:

- `completitud`
- `validez`
- `coincidencia_memoria`

---

### 5.6 Módulo: IA fallback

    IF confianza_baja -> usar Gemini API
    ELSE -> omitir IA

---

### 5.7 Módulo: Corrección humana

- `ui_editable`
- `mejora_aprendizaje`

---

## 🔄 6. FLUJO DEL SISTEMA

    Upload -> Extraer texto
    Extraer texto -> Parser
    Parser -> Memoria
    Memoria -> Score
    IF confianza_alta -> guardar -> mostrar
    ELSE -> IA fallback -> guardar -> mostrar

---

## 🧠 7. LÓGICA DE APRENDIZAJE

- `matching_ruc_proveedor`
- `matching_estructura`
- `reutilizacion_patrones`
- `refinamiento_incremental`

---

## 💻 8. INTEGRACIÓN EN LA WEB APP ACTUAL (Vite)

> **Nota:** NO se crea un proyecto nuevo. Se integra como motor interno modular.

---

### 8.1 Estructura de carpetas

```javascript
src/
 ├── services/              # existente
 │    ├── gemini.js
 │
 ├── engine/                # NUEVO
 │    ├── parser.js
 │    ├── rules.js
 │    ├── confidence.js
 │
 ├── memory/                # NUEVO
 │    ├── storage.js
 │    ├── matcher.js
 │
 ├── pipeline/              # NUEVO (cerebro)
 │    └── processDocument.js
 │
 ├── services/
 │    ├── ocr.js            # NUEVO
 │    ├── pdf.js            # NUEVO
 
 
---
---
title: Documentación de Motor Inteligente
version: 1.0.0
type: architecture
date: 2026-05-02
---

# Motor de Procesamiento y Arquitectura ⚙️

---
## 8.2 Cambio clave en arquitectura 🔁

❌ Antes:

```javascript
extractWithGemini(file)
```

✅ Ahora:

```javascript
processDocument(file)
```

---
## 8.3 Orquestador principal 🧠

Archivo: `pipeline/processDocument.js`

```javascript
export async function processDocument(file) {
  const text = await extractText(file);

  let data = parseInvoice(text);

  const memoryMatch = findSupplierPattern(data);

  if (memoryMatch) {
    data = applyMemoryPattern(text, memoryMatch);
  }

  const confidence = calculateConfidence(data);

  if (confidence < 0.7) {
    data = await extractWithGemini(file);
  }

  savePattern(data, text);

  return data;
}
```

---
## 8.4 Integración con UI existente 🎯

Antes:

```javascript
const result = await extractWithGemini(file);
```

Después:

```javascript
import { processDocument } from "../pipeline/processDocument";

const result = await processDocument(file);
```

---
## 8.5 Persistencia de memoria 💾

- Fase inicial: `localStorage`
- Fase intermedia: `IndexedDB`
- Fase SaaS: `backend (DB)`

---
## 8.6 Principio de diseño 🧠

- `UI desacoplada del motor`
- `motor independiente y reutilizable`
- `IA como módulo opcional`

---
## 9. ROADMAP 🚀

### Fase 1
- `OCR + parser básico`
- `extracción funcional`

### Fase 2
- `memoria por proveedor`

### Fase 3
- `confidence score`

### Fase 4
- `IA fallback`

### Fase 5
- `SaaS`

---
## 10. INSIGHT CLAVE 💡

### Este sistema no es:
- `“una app que usa IA”`

### Es:
- `un motor inteligente que usa IA solo cuando la necesita`

---
## CONCLUSIÓN 🎯

Sí puedes:
- `construirlo gratis`
- `integrarlo en tu app actual`
- `escalarlo a SaaS`
- `reducir costos de IA drásticamente`