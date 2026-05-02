---

# 🧠 Cortex (Producer OS)

---
## 🟢 Estado Actual
Infraestructura base completada (`Vite` + `Tailwind v4` + `Theme Engine`). Iniciando integración de servicios de nube (`Firebase`) y estructura de navegación maestra.

---
## ✅ Hitos Completados
- `Definición de Visión y Alcance`
- `Estructuración de requerimientos DAFO`
- `Definición de estética UI (Cloudy-Bento)`
- `Setup Técnico: Vite 6 + React 19 + Tailwind v4`
- `Theme Engine: ThemeContext con soporte nativo Mac/Manual y mitigación de FOUC`
- `Design Tokens: Variables de cristal y radios de 32px implementados en CSS`

---
## 🕒 Tareas Pendientes

### Infraestructura Base (Hito 1 - Continuación)
- `Implementación de Firebase SDK (Auth & Firestore)`
- `AuthScreen.jsx con lógica de Whitelist`
- `MainLayout + Sidebar (Estilo Cloudyfile con iconos 3D)`

### Frontend - Dashboard (Hito 2)
- `Pantalla de Proyectos (Cards iOS)`
- `Modal de "Nuevo Proyecto"`

---
## 📝 Notas de la sesión actual
La transición de tema se fijó en `0.4s`. Se utiliza `localStorage` con la llave `cortex-theme`. La estructura de carpetas en `src/` ya sigue el estándar de la arquitectura definida.