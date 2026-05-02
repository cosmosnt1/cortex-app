---
document_type: system_update_log
system_name: Cortex
module: finance_logic
status: completed
build_status: stable
---

# ✅ Implementación: Lógica Financiera y Saldo Bancario

Este documento registra los cambios realizados para profesionalizar el manejo de datos económicos en **Cortex**.

---

## 🎯 Cambios Realizados y Validados

### Soporte de Decimales (Double)
- `ESTADO: [COMPLETADO]`
- `Archivo`: `src/utils/money.js`
- `Función`: `formatPen()`
- `Librería`: `Intl.NumberFormat('es-PE')`
- `Alcance`: `DashboardView`, `ProjectCard` y `ProjectWorkspaceView`.

    IF monto_numerico -> formatPen() -> S/ XX.XX
    ELSE -> S/ 0.00

**Ejemplo:**
> Todos los montos ahora muestran decimales precisos y símbolo de Soles (S/).

### Indicadores del Banner (Wanna check your budget?)
- `ESTADO: [COMPLETADO]`
- `Fuente`: `Firestore`
- `Entidades`: `totalBudget`, `bankBalance`, `bankLastUpdate`

    SUM(totalBudget) de todos los proyectos -> Premio DAFO Total
    SUM(bankBalance) global -> Saldo en Banco
    MAX(bankLastUpdate) -> Timestamp de actualización

**Ejemplo:**
> Timestamp: Implementación de `src/utils/dates.js` para formatear `bankLastUpdate` (ej: 12 May, 10:30 AM), mostrando la actualización más reciente del ecosistema.

### ProjectCard.jsx
- `ESTADO: [COMPLETADO]`
- `UI`: `Radio 32px`
- `Efectos`: `Hover validados`

    (spentAmount / totalBudget) * 100 -> Lógica de Progreso (precisión decimal)
    IF spentAmount > totalBudget -> ACTIVAR badge "Sobrecosto" + Color ROJO
    ELSE -> Mostrar progreso estándar

### Modal "Nuevo Proyecto"
- `ESTADO: [COMPLETADO]`
- `Integridad`: `serverTimestamp()`

Atributo | Tipo | Descripción
---|---|---
`totalBudget` | Double | Presupuesto total asignado al proyecto.
`spentAmount` | Double | Monto total ejecutado/gastado.
`bankBalance` | Double | Flujo de caja real disponible en banco.

---

## 📖 Notas Técnicas

- `Firestore Rules`: Se habilitaron las reglas de `create` y `update` para la colección `projects`.
- `Build`: El comando `npm run build` se ejecutó sin errores.
- `Estabilidad`: Confirmada en el sistema de rutas y contextos globales.