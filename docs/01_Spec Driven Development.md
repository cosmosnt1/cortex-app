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
- `Estética`: High-end iOS (iOS 18+ style), Glassmorphism extremo, desenfoques, tipografía San Francisco, paleta de azules profundos (`#007AFF` y variantes oscuras). Experiencia fluida y "premium".

---

## 2. Objetivos del MVP 🎯

- `Native Grid`: Tabla interactiva dentro de la app que emula el formato DAFO pero con UX moderna.
- `Exportación`: Botón de "Generar Reporte DAFO" que exporta a Excel (.xlsx) con el formato exacto requerido.
- `Gestión de Archivos`:
    - `Nomenclatura automática`: 
        YYYY-MM-DD - Proveedor - NumeroComprobante.pdf
    - `Previsualización`: Visualización nativa de PDF (600+ archivos con alto rendimiento).
    - `Estados de Cuenta`: Subida mensual por proyecto.
- `Cálculos Bancarios`: Registro manual de saldo bancario con timestamp de última actualización.
- `Categorización Dinámica`: Creación de "Separadores/Sub-categorías" (Transporte, Logística, etc.) con lógica de agrupación (Parent-Child).

---

## 3. Especificaciones Técnicas 🛠️

- `Frontend`: React + Tailwind CSS (v4) + Framer Motion.
- `Backend`: Node.js.
- `Almacenamiento & Cloud`:
    - `Google Drive API`: Almacenamiento real de los PDFs.
        Jerarquía: Proyecto > Actividad > PDF
    - `Firebase Firestore`: Base de datos para el estado de la app (registros, sub-categorías, saldos).
- `IA`: Gemini 1.5 Pro (Vision) para extracción de datos en facturas/RHE/boletas.

---

## 4. Modelo de Datos Avanzado 📊



### 4.1 Entidades del Sistema

| Entidad | Atributos | Propósito |
| :--- | :--- | :--- |
| `Proyecto` | id, nombre, premio_total, saldo_banco, ultima_actualizacion_banco, whitelist_emails | Datos maestros del proyecto y control financiero. |
| `Gasto` | id, proyecto_id, actividad_id, subcategoria_id, fecha, tc, num_comprobante, proveedor, ruc, detalle, importe, responsable, drive_url | Registro detallado de cada movimiento y comprobante. |
| `Categorías` | id, proyecto_id, actividad_id, nombre, orden | Estructura de organización para el reporte DAFO. |

---

## 5. Arquitectura de Navegación 🗺️

- `Dashboard Global`: Vista de "Pájaros" de todos los proyectos.
- `Proyecto (Mesa de Trabajo)`:
    - `Pestañas`: Navegación por Actividades.
    - `Canvas`: Grid nativo de liquidación.
    - `Documentos`: Sección de archivos bancarios.
- `Visualizador`: Modal con efecto Glassmorphism para revisión y edición de datos extraídos.

---

## 6. Reglas de Negocio ⚖️

Confirmación de Documento:
    IF confirmación de datos -> Renombrar archivo en Drive según estándar YYYY-MM-DD

Persistencia de Datos:
    IF cambio en Native Grid -> Sincronización instantánea con Firestore

Gestión de Categorías:
    IF eliminar "Separador" -> Preguntar (Mover gastos a "Sin Categoría" OR Borrar registros)

---

## 7. UI/UX Requerimientos 🎨

- `Componentes`: Card de proyecto con desenfoque de fondo (Background blur).
- `Feedback`:
    IF campo obligatorio vacío (RUC o Importe) -> Vibración visual (shaking)
- `PDF Viewer`: Soporte para `pinch-to-zoom` y rotación para comprobantes mal escaneados.