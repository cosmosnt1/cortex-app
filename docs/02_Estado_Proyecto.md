---
project: "Cortex (Producer OS)"
phase: "Hito 4 Prep"
last_update: "2026-05-02"
---

# 🧠 ESTADO DEL PROYECTO: Cortex (Producer OS)

---
## 🟢 Estado Actual

Hito 3 (El Cerebro) Finalizado y **Estabilizado**. La UI ha sido refactorizada para usar un sistema de grilla de 12 columnas y bloqueada en **Light Theme** para maximizar la legibilidad de tablas financieras y asegurar exportaciones PDF limpias. Se migró a `gemini-1.5-flash` solucionando los límites de cuota (Rate Limits) y errores de concurrencia (congelamientos).
Estamos listos para el Hito 4: Los Pulmones (Google Drive).

---
## ✅ Hitos Completados

- `[x] Hito 1 - Infraestructura`: React 19, Tailwind v4, Auth con Whitelist y Layout Glassmorphism Light.
- `[x] Hito 2 - Finanzas`: Lógica de decimales, formato S/ y $, y Dashboard de carpetas.
- `[x] Hito 3 - El Cerebro (IA) y Refactor UI`:
  - Implementación de `gemini-1.5-flash` (mayor límite de requests).
  - UI `ExtractionDrawer` dividida en 48% (PDF) y 52% (Formulario 12-cols).
  - Inclusión de campos legales (`Empresa productora`, `Fondo Ganado`) en Firestore.
  - Carrusel de navegación de múltiples archivos integrado bajo el visor de PDF.
  - Fix de condición de carrera (Race Condition) al cargar Gemini.

---
## 🕒 Tareas Pendientes (Hito 4: Los Pulmones) - PRÓXIMO

- `[ ] Configuración GCP`: Crear proyecto en Google Cloud y credenciales OAuth para Drive.
- `[ ] Lógica de Subida`: Servicio para enviar archivos desde el Drawer a Drive.
- `[ ] Nomenclatura Forzada`: Renombrado automático: `[Fecha] - [Proveedor] - [N° Comprobante].pdf`.
- `[ ] Enlace de Datos`: Registro de `drive_url` en Firestore.

---
## 📝 Notas de la sesión actual

Se decidió por arquitectura eliminar el modo oscuro (Dark Mode) para evitar fatiga visual por "halación" en grids de alta densidad (DAFO) y facilitar la paridad visual WYSIWYG al exportar a PDF. Los formularios ahora manejan anchos flexibles y saltos de línea para textos largos de proveedores o detalles.