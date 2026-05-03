# 🗺️ ROADMAP — Motor Híbrido de Extracción de Comprobantes (Cortex)

---

## 🎯 Objetivo General

Construir un motor interno de procesamiento de comprobantes que:

- Funcione sin depender completamente de IA
- Aprenda de documentos anteriores
- Sea escalable a SaaS
- Se integre sin fricción a Cortex (Producer OS)

---

## 🧭 Enfoque Estratégico

El desarrollo seguirá esta lógica:

1. Primero: **hacer que funcione sin IA**
2. Luego: **hacer que aprenda**
3. Finalmente: **usar IA solo cuando sea necesario**

---

# 🚀 FASE 1 — Fundaciones del Motor (Pipeline)

### 🎯 Objetivo:
Separar completamente la lógica de extracción del frontend y de Gemini.

### 📦 Entregables:

- `[ ]` Crear estructura modular dentro de `src/`:
  - `engine/`
  - `memory/`
  - `pipeline/`
  - `services/ocr.js`
  - `services/pdf.js`

- `[ ]` Crear `processDocument(file)` como punto único de entrada
- `[ ]` Reemplazar llamadas directas a Gemini por el pipeline
- `[ ]` Logging básico del flujo (debug)

### 🧠 Resultado:
Cortex deja de depender directamente de Gemini.

---

# 🔍 FASE 2 — Extracción de Texto (Base Real)

### 🎯 Objetivo:
Leer correctamente cualquier comprobante (digital o escaneado)

### 📦 Entregables:

- `[ ]` Implementar extracción de texto para PDFs digitales
- `[ ]` Integrar OCR para PDFs escaneados e imágenes
- `[ ]` Normalizar texto (limpieza básica)
- `[ ]` Detectar tipo de archivo automáticamente

### 🧠 Resultado:
Ya tienes el **input real** del sistema (texto confiable).

---

# 🧠 FASE 3 — Parser Determinístico (Sin IA)

### 🎯 Objetivo:
Extraer datos clave usando reglas y regex

### 📦 Entregables:

- `[ ]` Detectar tipo de comprobante:
  - Factura → 01
  - Boleta → 03
  - RHE → 02

- `[ ]` Extraer:
  - RUC (11 dígitos)
  - Razón social (SAC, EIRL, SA)
  - Número de comprobante
  - Fecha
  - Moneda (PEN / USD)
  - Monto total

- `[ ]` Crear `normalizeInvoiceData()`
- `[ ]` Validaciones básicas (números, formatos)

### 🧠 Resultado:
Sistema funcional sin IA para la mayoría de casos.

---

# 📊 FASE 4 — Confidence Score

### 🎯 Objetivo:
Saber cuándo confiar en el resultado

### 📦 Entregables:

- `[ ]` Sistema de puntuación:
  - RUC detectado
  - Total detectado
  - Tipo detectado
  - Formato válido
  - Coincidencias con memoria

- `[ ]` Definir umbral:
  - `confidence >= 0.7` → válido
  - `< 0.7` → fallback

### 🧠 Resultado:
Decisiones automáticas inteligentes.

---

# 🧠 FASE 5 — Memoria y Aprendizaje

### 🎯 Objetivo:
Que el sistema mejore con cada comprobante

### 📦 Entregables:

- `[ ]` Guardar resultados en `localStorage` (fase inicial)
- `[ ]` Crear estructura de proveedor:
  - RUC
  - nombre
  - patrones
  - regex útiles

- `[ ]` Implementar matcher:
  - por RUC
  - por similitud de texto

- `[ ]` Reutilizar patrones en nuevos documentos
- `[ ]` Guardar correcciones manuales

### 🧠 Resultado:
Sistema que “aprende” sin entrenar modelos complejos.

---

# 🤖 FASE 6 — Fallback Inteligente con IA

### 🎯 Objetivo:
Usar Gemini solo cuando realmente se necesita

### 📦 Entregables:

- `[ ]` Integrar fallback a Gemini solo si:
  - baja confianza
  - campos faltantes

- `[ ]` Manejo de errores:
  - quota exceeded
  - retry controlado

- `[ ]` Logging:
  - cuándo se usa IA
  - por qué se usó

- `[ ]` Optimización de consumo:
  - evitar llamadas duplicadas

### 🧠 Resultado:
IA optimizada → menor costo → mayor control

---

# 🧩 FASE 7 — Integración Completa en UI

### 🎯 Objetivo:
Convertir el motor en experiencia usable

### 📦 Entregables:

- `[ ]` Reemplazar flujo actual por pipeline
- `[ ]` Mostrar estado:
  - procesando
  - OCR
  - parsing
  - fallback IA

- `[ ]` Mostrar resultado editable
- `[ ]` Permitir correcciones manuales
- `[ ]` Guardar cambios para aprendizaje

### 🧠 Resultado:
UX sólida y lista para uso real.

---

# 📂 FASE 8 — Integración con Google Drive

### 🎯 Objetivo:
Automatizar almacenamiento de comprobantes

### 📦 Entregables:

- `[ ]` Subida automática a Drive
- `[ ]` Renombrado:
  `[Fecha] - [Proveedor] - [Comprobante].pdf`
- `[ ]` Guardar `drive_url` en Firestore

### 🧠 Resultado:
Sistema completo de gestión documental.

---

# 🧪 FASE 9 — Validación con Datos Reales

### 🎯 Objetivo:
Probar con volumen real (~800 comprobantes)

### 📦 Entregables:

- `[ ]` Lote de pruebas reales
- `[ ]` Medición de:
  - precisión
  - errores
  - casos fallidos

- `[ ]` Ajuste de reglas
- `[ ]` Ajuste de memoria

### 🧠 Resultado:
Sistema confiable en producción.

---

# 🌐 FASE 10 — Preparación SaaS

### 🎯 Objetivo:
Escalar Cortex como producto

### 📦 Entregables:

- `[ ]` Migrar memoria a backend
- `[ ]` Multiusuario
- `[ ]` Historial por proyecto
- `[ ]` Exportación (Excel / CSV / DAFO-ready)
- `[ ]` Panel de revisión de documentos

### 🧠 Resultado:
Producto vendible.

---

# 💡 PRINCIPIO RECTOR

> “La IA no es el motor. Es el respaldo.”

---

# 🎯 RESULTADO FINAL ESPERADO

Un sistema que:

- Procesa comprobantes automáticamente
- Aprende con el uso
- Reduce costos de IA
- Escala a SaaS
- Se integra naturalmente con Cortex

---

# 🧠 NOTA FINAL

Este roadmap está diseñado para:

- avanzar rápido (vibe coding)
- evitar sobreingeniería
- construir valor real desde el inicio