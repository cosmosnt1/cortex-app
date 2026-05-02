---
document_type: system_specification
title: Cortex (Cloudy-Bento) Visual Design Manual
version: 0.7.0
compiler: Aura Markdown v07
theme: Cloudy-Bento
---

# 🌐 MANUAL DE DISEÑO VISUAL: CORTEX

---

## 1. Análisis de ADN Visual 🧬

### 1.1 Estructura de Pantalla (Master Layout)

- `sidebar_vertical`: Persistente a la izquierda. Fondo sólido en Light Mode, casi negro en Dark Mode. Íconos con estados activos en "burbuja" de color suave.
- `main_canvas`: El área de contenido tiene un fondo con un gradiente muy sutil para dar profundidad.
- `top_banner_contextual`: Área destacada en la parte superior que cambia según la pantalla.

    IF Pantalla == Dashboard -> Resumen de fondos (Premio, Gastado, Saldo)
    IF Pantalla == Proyecto -> Detalles del proyecto y barra de progreso

### 1.2 Componentes de Navegación (Folders & Cards)

- `tarjetas_de_proyecto`: Rectángulos grandes con bordes `rounded-[32px]`. Muestran el logo del proyecto en 3D y una barra de progreso de liquidación integrada en la base.
- `carpetas_de_actividad`: Siguiendo la imagen de referencia, cada una de las 6 actividades DAFO es una carpeta con un ícono 3D que "flota" sobre un fondo pastel con sombras suaves.
- `seccion_latest`: Grid inferior de tarjetas pequeñas para los últimos comprobantes subidos, permitiendo una auditoría rápida visual.

---

## 2. Paleta de Colores Dinámica (Theming) 🎨

| Elemento | Modo Light (Día) | Modo Dark (Noche) |
| :--- | :--- | :--- |
| Fondo Base | #F8F9FB (Gris Nube) | #0B0E14 (Deep Black) |
| Cards / Folders | #FFFFFF (Blanco Puro) | #161B22 (Dark Grey-Blue) |
| Sidebar | Blanco con borde #E5E7EB | #0D1117 con borde #30363D |
| Texto Primario | #1A1D23 | #E6EDF3 |
| Acento (Cortex Blue) | #007AFF | #58A6FF |

---

## 3. Mapeo Visual DAFO (Iconografía 3D) 📽️

- `actividad_1_crew`: Ícono 3D de grupo humano / Azul Pastel.
- `actividad_2_pre_produccion`: Ícono 3D de claqueta o calendario / Naranja Melocotón.
- `actividad_3_rodaje`: Ícono 3D de cámara de cine profesional / Verde Menta.
- `actividad_4_transporte_logistica`: Ícono 3D de furgoneta o maleta / Amarillo Suave.
- `actividad_5_alimentacion`: Ícono 3D de bandeja de catering / Rosa Pálido.
- `actividad_6_post_produccion`: Ícono 3D de estación de edición / Púrpura.

---

## 4. Componentes de Interacción Avanzada ⚡

### 4.1 El "Extraction Drawer" (Efecto Glassmorphism)

**Ejemplo:**
> Visualización de la extracción de datos mediante IA sobre un comprobante fiscal PDF.

- `fondo`: backdrop-blur-2xl con `bg-white/10` (en Dark) o `bg-white/70` (en Light).
- `campos_de_ia`: Los inputs deben tener un estado de "Cargando" animado (Skeleton) mientras Gemini extrae los datos.
- `validacion_visual`: Lógica de respuesta inmediata según la integridad del dato.

    IF RUC extraído == válido (11 dígitos) -> Borde del input brilla en verde
    ELSE -> Borde estándar o alerta ámbar

### 4.2 El Grid Nativo (Smart Table)

- `estructura_filas`: En lugar de celdas rígidas, usa filas con bordes redondeados y espacio (gap) entre ellas.
- `interaccion_hover`: Al pasar el mouse (hover), la fila debe resaltar con el color de acento de la actividad correspondiente.

---

## 5. Micro-animaciones y Feedback 🔄

- `transicion_de_tema`: El cambio entre Light y Dark debe durar 0.4s con una curva de transición suave.
- `efecto_de_carga`: El botón de "Confirmar y Liquidar" debe mostrar un check animado estilo iOS al finalizar con éxito.
- `ordenamiento_logico`: Comportamiento de las tarjetas durante la re-categorización.

    IF Mover gasto entre categorías -> Tarjeta sigue el cursor con efecto "muelle" (spring physics)
    ELSE -> Posición estática suave