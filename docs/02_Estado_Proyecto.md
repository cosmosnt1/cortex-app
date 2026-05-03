# 🧠 ESTADO DEL PROYECTO: Cortex (Producer OS)

---
## 🟢 Estado Actual

Hito 3 (El Cerebro) finalizado y estabilizado. La UI ha sido refactorizada para usar un sistema de grilla de 12 columnas y bloqueada en **Light Theme** para maximizar la legibilidad de tablas financieras y asegurar exportaciones PDF limpias.

La integración con Gemini se encuentra funcional como capa de apoyo, pero el enfoque del producto está evolucionando hacia un **motor híbrido de extracción de comprobantes** para reducir dependencia de IA, bajar costos y mejorar precisión con documentos reales.

Actualmente el proyecto está listo para avanzar en dos frentes:

1. **Hito 4: Motor Híbrido de Extracción de Comprobantes**
2. **Hito 5: Los Pulmones (Google Drive)**

---
## ✅ Hitos Completados

- `[x] Hito 1 - Infraestructura`:
  - React 19
  - Tailwind v4
  - Auth con Whitelist
  - Layout Glassmorphism Light

- `[x] Hito 2 - Finanzas`:
  - Lógica de decimales
  - Formato S/ y $
  - Dashboard de carpetas

- `[x] Hito 3 - El Cerebro (IA) y Refactor UI`:
  - Implementación inicial de Gemini como capa de extracción
  - UI `ExtractionDrawer` dividida en 48% (PDF) y 52% (Formulario 12-cols)
  - Inclusión de campos legales (`Empresa productora`, `Fondo Ganado`) en Firestore
  - Carrusel de navegación de múltiples archivos integrado bajo el visor de PDF
  - Fix de condición de carrera (Race Condition) al cargar Gemini
  - Refactor visual orientado a tablas financieras y documentación limpia

---
## 🧠 Nuevo Eje Estratégico: Motor Híbrido de Extracción

Se definió como prioridad construir un motor interno que procese comprobantes de pago sin depender completamente de IA.

### Objetivo del motor
- Leer PDFs digitales y escaneados
- Extraer datos estructurados
- Aprender de comprobantes anteriores
- Reutilizar patrones por proveedor
- Usar IA solo como fallback cuando sea necesario

### Enfoque técnico
- OCR para PDFs escaneados
- Extracción directa de texto para PDFs electrónicos
- Regex y heurísticas para identificar:
  - tipo de comprobante
  - RUC
  - razón social
  - número de comprobante
  - fecha
  - moneda
  - total
- Memoria local de patrones por proveedor
- Score de confianza por documento
- Gemini solo como respaldo para casos difíciles

### Motivo de este cambio
- El volumen esperado de comprobantes por proyecto puede llegar a ~800 documentos
- El uso de IA por cada extracción vuelve el sistema costoso
- Muchos documentos siguen patrones repetibles que pueden resolverse con reglas y memoria
- El objetivo del producto es ser útil ahora, pero también escalable luego a SaaS

---
## 🕒 Tareas Pendientes (Hito 4: Motor Híbrido de Extracción) - PRÓXIMO

- `[ ] Definición del pipeline interno`: Separar la extracción de texto, parsing, memoria y fallback IA en módulos independientes.
- `[ ] Lectura de PDFs digitales`: Implementar extracción directa de texto para comprobantes electrónicos y RHE.
- `[ ] OCR para escaneados`: Integrar OCR local para PDFs escaneados o imágenes.
- `[ ] Parser base`: Crear reglas y regex para detectar:
  - tipo de comprobante
  - RUC
  - razón social
  - número de comprobante
  - fecha
  - moneda
  - total
- `[ ] Motor de memoria`: Guardar patrones por proveedor y reutilizar coincidencias en futuras cargas.
- `[ ] Confidence score`: Calcular nivel de confianza por documento procesado.
- `[ ] Fallback con Gemini`: Usar IA solo cuando el parser no alcance suficiente precisión.
- `[ ] Normalización de salida`: Unificar la data a un JSON estructurado y consistente.
- `[ ] Integración en UI`: Reemplazar la llamada directa a Gemini por `processDocument(file)`.
- `[ ] Pruebas con documentos reales`: Validar el sistema con facturas, boletas y recibos de honorarios reales.

---
## 🕒 Tareas Pendientes (Hito 5: Los Pulmones - Google Drive)

- `[ ] Configuración GCP`: Crear proyecto en Google Cloud y credenciales OAuth para Drive.
- `[ ] Lógica de Subida`: Servicio para enviar archivos desde el Drawer a Drive.
- `[ ] Nomenclatura Forzada`: Renombrado automático: `[Fecha] - [Proveedor] - [N° Comprobante].pdf`.
- `[ ] Enlace de Datos`: Registro de `drive_url` en Firestore.

---
## 📝 Notas de la sesión actual

Se decidió por arquitectura eliminar el modo oscuro (Dark Mode) para evitar fatiga visual por "halación" en grids de alta densidad (DAFO) y facilitar la paridad visual WYSIWYG al exportar a PDF.

Los formularios ahora manejan anchos flexibles y saltos de línea para textos largos de proveedores o detalles.

También se definió que el siguiente salto del producto ya no será depender de IA para cada comprobante, sino construir un motor híbrido interno que aprenda de los documentos anteriores y reduzca costos operativos.