---
project: Cortex
module: Expense Settlement & DAFO Automation
milestone: 1 - Base Infrastructure & Auth
author: Aura Markdown v07
status: executing
tech_stack: [React, Tailwind CSS, Firebase, Google Drive API]
---

# 🧠 Proyecto Cortex: Producer OS

Este documento compila la configuración inicial del **Hito 1**, estableciendo los cimientos de autenticación y la estética Glassmorphism requerida para el entorno de producción cinematográfica.

---

## 1. Configuración de Firebase y Proveedor de Autenticación 🔒

Para la gestión de usuarios y persistencia de metadata en Firestore, implementamos el `AuthProvider`.

| Atributo | Tipo | Descripción |
| :--- | :--- | :--- |
| `user` | Object | Datos del usuario autenticado en Firebase |
| `loading` | Boolean | Estado de carga de la sesión inicial |
| `driveAccess` | Boolean | Verificación de permisos para Google Drive |

### 1.1 Lógica de Inicialización de Sesión
    IF firebase_user_exists -> sync_firestore_metadata
    IF user_has_google_token -> enable_drive_features
    ELSE -> trigger_google_oauth_popup

### 1.2 Dependencias Críticas
- `firebase/app`
- `firebase/auth`
- `firebase/firestore`

---

## 2. Definición Estética: Sistema de Diseño Glassmorphism 🎨

Basado en las directrices de diseño iOS para el módulo de liquidación de gastos.

**Ejemplo:**
> Aplicación de clases Tailwind para el contenedor principal de la App:
> `bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl`

### 2.1 Componentes de UI Base
- `GlassCard`: Contenedor base para formularios de gastos.
- `GlassButton`: Botones con efecto hover de iluminación suave.
- `GlassInput`: Campos de texto translúcidos.

---

## 3. Integración de Google Drive API (Estructura de Archivos) 📂

Los archivos PDF de los gastos se almacenarán directamente en carpetas de proyecto.

### 3.1 Mapeo de Directorios
    IF folder_name == "Cortex_Expenses" -> get_id
    ELSE -> create_project_folder_in_drive

- `upload_to_drive`: Función para enviar `Blob` de PDF.
- `Youtube`: Recuperación de IDs de archivos para Firestore.

---

## 4. Archivo: ESTADO_PROYECTO.md 📊

A continuación, la actualización del estado del sistema tras la implementación del Hito 1.

### 4.1 Tareas Completadas
- `setup_react_boilerplate`
- `init_firebase_sdk`
- `configure_tailwind_glassmorphism`
- `auth_provider_implementation`

### 4.2 Tareas Pendientes (Hito 2)
- `desarrollo_interfaz_liquidacion`
- `ocr_integration_engine`
- `firestore_schema_design`

---

## 5. Implementación de Componente Base: `AuthScreen.jsx` 🚀

```jsx
import React from 'react';

const AuthScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Cortex</h1>
        <p className="text-white/60 text-center mb-8">Producer OS: Módulo de Gastos</p>
        
        <button 
          className="w-full py-4 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
          onClick={() => console.log('Iniciando Google Auth...')}
        >
          <span className="font-semibold">Acceder con Google</span>
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;