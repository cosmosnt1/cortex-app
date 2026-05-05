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

- `[x]` Crear estructura modular dentro de `src/`:
  - `engine/`
  - `memory/`
  - `pipeline/`
  - `services/ocr.js`
  - `services/pdf.js`

- `[x]` Crear `processDocument(file)` como punto único de entrada
- `[x]` Reemplazar llamadas directas a Gemini por el pipeline
- `[x]` Logging básico del flujo (debug)

### 🧠 Resultado:
Cortex deja de depender directamente de Gemini.

---

# 🔍 FASE 2 — Extracción de Texto (Base Real)

### 🎯 Objetivo:
Leer correctamente cualquier comprobante (digital o escaneado)

### 📦 Entregables:

- `[x]` Implementar extracción de texto para PDFs digitales
- `[x]` Integrar OCR local (Tesseract) para imágenes
- `[x]` **NUEVO:** Puente PDF-to-Image dinámico para PDFs escaneados sin capa de texto.
- `[x]` Normalizar texto (limpieza básica)
- `[x]` Detectar tipo de archivo automáticamente

### 🧠 Resultado:
Ya tienes el **input real** del sistema (texto confiable).

---

# 🧠 FASE 3 — Parser Determinístico (Sin IA)

### 🎯 Objetivo:
Extraer datos clave usando reglas y regex

### 📦 Entregables:

- `[x]` Detectar tipo de comprobante (Factura: 01, Boleta: 03, RHE: 02)
- `[x]` Extraer:
  - RUC (11 dígitos)
  - Razón social (SAC, EIRL, SA) con formateo `Title Case`
  - Número de comprobante
  - Fecha (Soporte flexible para 1 o 2 dígitos)
  - Moneda (PEN / USD)
  - Monto total (Extracción inteligente de máximos absolutos)
- `[x]` **NUEVO:** Cazador de Items inteligente (Limpieza de cantidades y precios).
- `[x]` **NUEVO:** Filtro Antibazofia / Anti-Falsos Positivos (Ignorar 'Neptuno Films', evitar atrapar 'impreSA').

### 🧠 Resultado:
Sistema funcional sin IA para la mayoría de casos.

---

# 📊 FASE 4 — Confidence Score

### 🎯 Objetivo:
Saber cuándo confiar en el resultado

### 📦 Entregables:

- `[x]` Sistema de puntuación:
  - RUC detectado
  - Total detectado
  - Tipo detectado
  - Formato válido
  - Coincidencias con memoria

- `[x]` Definir umbral:
  - `confidence >= 0.7` → válido
  - `< 0.7` → fallback

### 🧠 Resultado:
Decisiones automáticas inteligentes.

---

# 🧠 FASE 5 — Memoria y Aprendizaje

### 🎯 Objetivo:
Que el sistema mejore con cada comprobante

### 📦 Entregables:

- `[x]` Guardar resultados en `localStorage` (fase inicial)
- `[x]` Crear estructura de proveedor: (RUC = Nombre)
- `[x]` Implementar matcher: Rescate de nombres mediante reconocimiento de RUC.
- `[x]` **NUEVO:** Flujo "Human-in-the-loop": El guardado en memoria solo se detona tras la corrección y confirmación manual del usuario.

### 🧠 Resultado:
Sistema que “aprende” progresivamente sin entrenar modelos complejos.

---

# 🤖 FASE 6 — Fallback Inteligente con IA

### 🎯 Objetivo:
Usar Gemini solo cuando realmente se necesita

### 📦 Entregables:

- `[x]` Integrar fallback a Gemini solo si hay baja confianza.
- `[x]` Hacer merge priorizando el motor o Gemini según disponibilidad.
- `[x]` Logging en consola (cuándo se usa IA, cuándo se ahorra dinero 💸).
- `[x]` Filtro de falsos positivos aplicado también al fallback de la IA.

### 🧠 Resultado:
IA optimizada → menor costo → mayor control.

---

# 🧩 FASE 7 — Integración Completa en UI

### 🎯 Objetivo:
Convertir el motor en experiencia usable

### 📦 Entregables:

- `[x]` Reemplazar flujo actual por pipeline en `ExtractionDrawer.jsx`.
- `[x]` Mostrar estado (loaders para procesamiento de OCR y PDF).
- `[x]` Mostrar resultado editable de forma instantánea.
- `[x]` Permitir correcciones manuales en el Drawer.
- `[x]` Guardar cambios para aprendizaje al confirmar.

### 🧠 Resultado:
UX sólida y lista para uso real.

---

# 📂 FASE 8 — Integración con Google Drive (⏳ EN PROCESO)

### 🎯 Objetivo:
Automatizar almacenamiento de comprobantes

### 📦 Entregables:

- `[ ]` Configuración de GCP (Habilitar Drive API y Scopes OAuth).
- `[ ]` Subida automática a Drive.
- `[ ]` Renombrado forzado: `[Fecha] - [Proveedor] - [Comprobante].pdf`
- `[ ]` Guardar `drive_url` en Firestore.

### 🧠 Resultado:
Sistema completo de gestión documental en la nube.

---

# 🧪 FASE 9 — Validación con Datos Reales

### 🎯 Objetivo:
Probar con volumen real (~800 comprobantes)

### 📦 Entregables:

- `[ ]` Lote de pruebas reales
- `[ ]` Medición de precisión y casos fallidos
- `[ ]` Ajuste final de reglas y memoria

### 🧠 Resultado:
Sistema confiable en producción.

---

# 🌐 FASE 10 — Preparación SaaS

### 🎯 Objetivo:
Escalar Cortex como producto

### 📦 Entregables:

- `[ ]` Migrar memoria (`localStorage`) a Backend (Firestore).
- `[ ]` Multiusuario e Historial por proyecto.
- `[ ]` Exportación (Excel / CSV / DAFO-ready).
- `[ ]` Panel de revisión de documentos.

### 🧠 Resultado:
Producto vendible.

---

# 💡 PRINCIPIO RECTOR

> “La IA no es el motor. Es el respaldo.”