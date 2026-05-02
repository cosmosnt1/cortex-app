---
project: Cortex (Producer OS)
version: 0.7.0
status: Hito 2 Advanced
engine: Vite 6 + Tailwind v4
---

# 🧠 ESTADO DEL PROYECTO: Cortex (Producer OS)

---
## 🟢 Estado Actual

Hito 2 en progreso avanzado. El Dashboard es ahora 100% dinámico y maneja lógica financiera real (decimales, soles peruanos, y saldos bancarios). El sistema de navegación entre Dashboard y Proyectos está operativo.

    IF dashboard_dinámico == true -> Manejo de decimales (Double)
    IF moneda == PEN -> Formateo Soles Peruanos

---
## ✅ Hitos Completados

- `Setup & Auth`: Vite 6 + Tailwind v4 + Firebase Auth (Whitelist).
- `Theme Engine`: Soporte nativo de temas con mitigación de FOUC.
- `Finanzas Core`: Formateo de moneda PEN, soporte de decimales (Double) y Timestamps de servidor.
- `Dashboard Dinámico`: Banner de presupuesto total y Cards de proyecto (Folder Style) con barras de progreso de sobrecosto.
- `Gestión de Datos`: Modal de creación de proyectos conectado a Firestore con serverTimestamp.

---
## 🕒 Tareas Pendientes (Próximos Pasos)

### Hito 3: El Cerebro (IA & Extracción) - PRÓXIMO
- `Configuración de la API de Gemini 1.5 Pro (Vision)`
- `Diseño del Extraction Drawer` (Panel lateral de cristal para revisión de facturas).
- `Lógica de mapeo`

    PDF / Imagen -> JSON (Fecha, RUC, Monto)

### Hito 4: Los Pulmones (Drive & Almacenamiento)
- `Integración de Google Drive API`
- `Nomenclatura automática de archivos al subir`

---
## 📝 Notas de la sesión actual

Se validó que el `ProjectCard` responde correctamente a los sobrecostos (color rojo). El saldo bancario global se calcula correctamente sumando los saldos individuales de cada proyecto.

**Ejemplo:**
> Visualización de alertas financieras en el dashboard principal cuando un proyecto excede el límite asignado.

    IF gasto_actual > presupuesto_asignado -> ProjectCard(status: "sobrecosto", color: "rojo")
    FOR EACH proyecto -> SUM(saldo_individual) -> saldo_bancario_global