---
project: Cortex (Producer OS)
status: Phase Definition Completed
milestone: Control Structure & Data Architecture
author: Aura Markdown v07
---

# 🧠 Cortex (Producer OS)

---

## 🟢 Estado Actual
El proyecto se encuentra en la transición post-definición, iniciando la fase de construcción técnica.

---

## ✅ Hitos Completados
- [x] Definición de `Visión y Alcance` (Spec Driven Development).
- [x] Estructuración de `requerimientos DAFO` (Perú).
- [x] Definición de `estética UI` (Glassmorphism / iOS).

---

## 🕒 Tareas Pendientes

### Infraestructura Base
- [ ] Configuración de `entorno React` con `Tailwind` y `Framer Motion`.
- [ ] Implementación de `Auth con Google` (Whitelist).

### Frontend - Dashboard
- [ ] Creación de la `pantalla de Proyectos` (estilo Cards iOS).
- [ ] Modal de `Nuevo Proyecto`.

### Módulo Liquidación
- [ ] Desarrollo del `Grid Nativo` (Tabla inteligente).
- [ ] Sistema de `subida de archivos` (Drag & Drop).

### Integración IA
- [ ] Conexión con `Gemini API` para lectura de comprobantes.

### Nube
- [ ] Conexión con `Google Drive API` para almacenamiento jerárquico.

---

## 📝 Notas de la última sesión
**Ejemplo:**
> Se decidió eliminar la dependencia directa de Google Sheets para el trabajo diario, usándolo solo como formato de exportación final.

    IF flujo de datos -> Interno (Cortex DB)
    ELSE -> Exportación (Google Sheets)

El nombre oficial del sistema será `Cortex`.