---
document_type: system_specification
title: Cortex Visual Design Manual
version: 1.0.0 (Light-Only MVP)
compiler: Aura Markdown v07
theme: Cloudy-Bento Light
---

# 🌐 MANUAL DE DISEÑO VISUAL: CORTEX

---

## 1. Análisis de ADN Visual 🧬

### 1.1 Estructura de Pantalla (Master Layout)

- `Decisión Arquitectónica`: **Light Theme Forzado**. Se eliminó el modo oscuro para evitar el efecto de "halación" visual en las tablas financieras densas (DAFO) y garantizar que lo que el usuario ve en pantalla es exactamente igual al PDF/Excel exportado (WYSIWYG).
- `sidebar_vertical`: Persistente a la izquierda. Fondo blanco puro con bordes grises suaves.
- `main_canvas`: Fondo de aplicación `bg-slate-50` o gradiente sutil blanco-azulado para dar profundidad.

### 1.2 Componentes de Navegación

- `tarjetas_de_proyecto`: Rectángulos blancos `rounded-[32px]` con bordes `blue-100` y sombras amplias y difuminadas. Efecto de levitación (scale-105) en hover.
- `carpetas_de_actividad`: Carpetas DAFO sobre fondos pasteles con sombras suaves.

---

## 2. Paleta de Colores Dinámica (Theming) 🎨

| Elemento | Modo Light (Definitivo) |
| :--- | :--- |
| Fondo Base | #F8F9FB (Gris Nube / Slate-50) |
| Cards / Folders | #FFFFFF (Blanco Puro) |
| Bordes UI | Slate-200 / Blue-100 |
| Texto Primario | Slate-800 / Slate-900 |
| Texto Secundario | Slate-500 |
| Acento Principal | #007AFF (Blue-600) / Success: Emerald-600 |

---

## 3. Componentes de Interacción Avanzada ⚡

### 3.1 El "Extraction Drawer" (Modal IA)

- `Layout Asimétrico`: 48% izquierda (Visor PDF + Carrusel Inferior) y 52% derecha (Formulario Inteligente).
- `Carrusel de Archivos`: Botones azules y pastillas de contador situados estrictamente debajo de la imagen del PDF.
- `Smart Form`: Grilla de 12 columnas. Ajuste dinámico de campos (Moneda expande a 7 columnas si es Soles; baja de fila y calcula tipo de cambio si es Dólares).

### 3.2 El Grid Nativo (DAFO Table - Próximamente)

- Las celdas deben ser blancas con bordes sutiles.
- Interacción hover con resaltado pastel del color de la actividad correspondiente.