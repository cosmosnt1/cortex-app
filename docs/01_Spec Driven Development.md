---
title: Cortex (Producer OS)
module: Cortex Liquidación
system_status: MVP Specifications
author: Aura Markdown v07
---

# 🎥 Cortex (Producer OS)

---

## 1. Visión General 👁️

- `Visión`: Suite integral nativa para producción ejecutiva cinematográfica.
- `Módulo Actual`: Cortex Liquidación. Sistema nativo de rendición DAFO con extracción inteligente y gestión de archivos.
- `Estética`: High-end iOS (iOS 18+ style), Glassmorphism, desenfoques, tipografía San Francisco. **Fijado estrictamente a Light Theme** para garantizar paridad WYSIWYG (What You See Is What You Get) con la exportación a PDF de reportes financieros.

---

## 2. Objetivos del MVP 🎯

- `Native Grid`: Tabla interactiva dentro de la app que emula el formato DAFO pero con UX moderna.
- `Exportación`: Botón de "Generar Reporte DAFO" que exporta a PDF/Excel con el formato exacto requerido (fondo blanco, bordes limpios).
- `Gestión de Archivos`:
    - `Nomenclatura automática`: YYYY-MM-DD - Proveedor - NumeroComprobante.pdf
    - `Previsualización`: Visualización nativa de PDF con visor adaptativo al ancho.
    - `Carrusel de Lotes`: Navegación inferior compacta para procesar múltiples comprobantes.
- `Cálculos Bancarios`: Registro manual de saldo bancario con timestamp.
- `Categorización Dinámica`: Creación de "Separadores/Sub-categorías" con lógica Parent-Child.

---

## 3. Especificaciones Técnicas 🛠️

- `Frontend`: React + Tailwind CSS (v4) + Framer Motion.
- `Backend`: Node.js.
- `Almacenamiento & Cloud`:
    - `Google Drive API`: Almacenamiento real de los PDFs.
    - `Firebase Firestore`: Base de datos para el estado de la app.
- `IA`: **Gemini 1.5 Flash** para extracción de datos rápida, precisa y con alta cuota de límite.

---

## 4. Modelo de Datos Avanzado 📊

### 4.1 Entidades del Sistema

| Entidad | Atributos | Propósito |
| :--- | :--- | :--- |
| `Proyecto` | id, nombre, **empresa**, **fondoGanado**, premio_total, saldo_banco, status | Datos maestros legales del proyecto y control financiero. |
| `Gasto` | id, proyecto_id, actividad_id, fecha, tc, num_comprobante, proveedor, ruc, detalle, importe, drive_url | Registro detallado de cada movimiento extraído. |
| `Categorías` | id, proyecto_id, actividad_id, nombre, orden | Estructura para el reporte DAFO. |

---

## 5. Arquitectura de Navegación 🗺️

- `Dashboard Global`: Vista de proyectos con tarjetas claras, bordes azules y progreso.
- `Proyecto (Mesa de Trabajo)`: Pestañas por Actividades, Grid nativo y Documentos.
- `Visualizador (Extraction Drawer)`: Modal con diseño Glassmorphism de 2 columnas (Vista Previa 48% / Formulario Inteligente 52%).

---

## 6. Reglas de Negocio ⚖️

Confirmación de Documento:
    IF confirmación de datos -> Guardar gasto en Firestore Y auto-avanzar carrusel al siguiente documento.

Persistencia de Datos:
    IF cambio en Native Grid -> Sincronización instantánea con Firestore.