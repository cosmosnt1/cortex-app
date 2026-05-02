---
title: Arquitectura Cloudy-Cortex
version: 1.0.0
type: System_Specification
status: Draft
---

# 🚀 ARQUITECTURA Y FLUJO DE USUARIO (Versión Cloudy-Cortex)

---
## 1. Mapa de Pantallas 🗺️

### S1: Auth (Estilo Minimal)
- `Logo de Cortex` en el centro. 
    IF tema detectado -> Fondo con gradiente dinámico (Light/Dark)
- `Botón de Google Login` con efecto de cristal.

### S2: Dashboard de Proyectos (The Folders View)
Siguiendo fielmente la imagen de referencia:
    Banner Superior: "Wanna check your budget?" -> Muestra el estado del Premio DAFO y saldo en banco.
- `Sección "Proyectos"`: Cards grandes con iconos 3D representando cada película/proyecto.
- `Sidebar Izquierda`: Acceso rápido a Home, Proyectos, Análisis y Configuración.

### S3: Espacio de Trabajo del Proyecto (Detalle)
- `Header`: Nombre del Proyecto y monto total.
- `Folders (Actividades)`: Grid de 6 carpetas (Actividades 1 a 6) con sus iconos 3D y colores asignados.
- `Latest (Gastos Recientes)`: Debajo de las carpetas, una cuadrícula de los últimos comprobantes subidos a todo el proyecto, permitiendo ver de un vistazo qué se ha liquidado últimamente.

### S4: Modal de Extracción / Drawer
    IF clic en actividad OR botón "+" -> Activar Modal
- `Diseño Glassmorphism`.
- `Lado Izquierdo`: Previsualización grande del PDF.
- `Lado Derecho`: Campos inteligentes (IA) para confirmar: Fecha, Proveedor, RUC, Monto.

---
## 2. Estructura de Carpeta Raíz 📁

    /Cortex-App
    ├── /docs                 # Guías de diseño y specs
    ├── /src
    │   ├── /assets           
    │   │   ├── /3d-assets    # Iconos 3D optimizados (PNG/GLB)
    │   │   └── /branding     
    │   ├── /components       
    │   │   ├── /layout       # Sidebar (Cloudy Style), PageContainer
    │   │   ├── /ui           # FolderCard, LatestCard, BentoGrid, ThemeSwitch
    │   │   └── /features     # ExtractDrawer, PDFPreview, BudgetSummary
    │   ├── /context          # AuthContext, ThemeContext (Light/Dark)
    │   ├── /services         # Firebase, GeminiVision, DriveAPI
    │   ├── /views            # LoginView, DashboardView, ProjectView
    │   └── App.js            
    ├── /public               
    ├── .env                  
    └── tailwind.config.js    # Radios de 32px y sombras personalizadas

---
## 3. Lógica de Temas 🎨

    IF usuario selecciona manual -> Alternar Tema (Light/Dark)
    ELSE -> Detectar configuración de sistema Mac
    
    ON cambio de tema -> Aplicar transición suave (0.3s) en fondos y tarjetas