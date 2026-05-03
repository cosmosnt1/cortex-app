# 🧠 Handoff AI — Cortex (Producer OS)

---

## 1. 🎯 Resumen del Proyecto

Cortex es un sistema operativo para productores audiovisuales (Producer OS) enfocado en la gestión financiera y documental de proyectos, especialmente orientado a rendiciones tipo DAFO (Perú).

El sistema permite:

- Procesar comprobantes de pago (facturas, boletas, RHE)
- Extraer información estructurada automáticamente
- Gestionar documentos y metadatos
- Preparar información para rendiciones financieras

---

## 2. 🟢 Estado Actual del Proyecto

- Hitos 1, 2 y 3 completados (Infraestructura, Finanzas, IA + UI)
- UI estabilizada con sistema de grilla de 12 columnas
- Tema visual bloqueado en Light Mode (optimizado para tablas y exportación)
- Integración inicial con Gemini funcional (pero ya no es el enfoque principal)

### Cambio estratégico clave:

El proyecto está migrando de:
> “Extracción basada en IA”

a:
> **Motor híbrido interno (OCR + parser + memoria + IA fallback)**

---

## 3. 🧠 Decisiones Técnicas Importantes (NO romper)

- La IA (Gemini) **NO es el motor principal**
- La IA se usa **solo como fallback**
- El sistema debe funcionar mayormente **sin costo por request**
- La extracción debe ser:
  - determinística primero
  - inteligente después
- La UI ya está optimizada → evitar cambios innecesarios en layout

---

## 4. 🏗️ Arquitectura Actual (Objetivo)

El flujo objetivo del sistema es:

```text
UI →
  processDocument(file) →
    extracción de texto →
    parser →
    memoria →
    confidence score →
    IA (solo si falla)
→ resultado estructurado

---

# ⚙️ Directrices de Operación y Desarrollo

---
## 5. Documentos Fuente de Verdad 📂

Leer en este orden:

    02_Estado_Proyecto.md -> estado actual real
    06_PRD_Motor_Hibrido_Extraccion...md -> diseño completo del sistema
    07_Roadmap_Motor_Hibrido_Extrac...md -> plan de ejecución
    05_Arquitectura_Flujo.md -> contexto técnico previo
    09_Logica_Financiera.md -> reglas de negocio

---
## 6. Objetivo Actual de Desarrollo 🎯

Implementar el Motor Híbrido de Extracción de Comprobantes

### Prioridades inmediatas:

- `Crear pipeline processDocument`
- `Separar lógica de extracción de la UI`
- `Implementar parser sin IA`
- `Integrar OCR + lectura de PDFs`
- `Crear sistema de memoria por proveedor`

---
## 7. Restricciones 🚫

La IA NO debe:

- `Reescribir toda la arquitectura`
- `Volver a un enfoque dependiente 100% de IA`
- `Romper la UI existente`
- `Introducir complejidad innecesaria (microservicios, overengineering)`

---
## 8. Cómo debe comportarse la IA 🧠

La IA debe:

- `Respetar el roadmap actual`
- `Trabajar de forma incremental (no big rewrites)`
- `Priorizar soluciones simples y funcionales`
- `Pensar en costo, escalabilidad y uso real`
- `Proponer código listo para integrar en Vite`

---
## 9. Próximo Paso Esperado 📌

Continuar con:
👉 FASE 1 del roadmap: Pipeline base

### Específicamente:

- `Crear processDocument.js`
- `Definir flujo de procesamiento`
- `Preparar integración con UI existente`
- `Mantener Gemini como fallback, no como core`

---
## 10. Contexto Clave del Negocio 💡

- `Uso real: ~800 comprobantes por proyecto`
- `Usuarios: productores audiovisuales`
- `Documentos: Facturas (variables)`
- `Documentos: Boletas (variables)`
- `Documentos: RHE (muy estandarizados)`
- `Escaneos: PDF a 300 ppp`
- `Necesidad: precisión + bajo costo + velocidad`

---
## 11. Principio Rector 🎯

“La IA es un respaldo, no el motor.”

---
## 12. Nota para cualquier IA futura ⚠️

Antes de sugerir cambios:

- `Validar contra el Estado del Proyecto`
- `Validar contra el PRD`
- `Validar contra el Roadmap`

    Si algo contradice esos documentos -> señalarlo antes de proponer cambios