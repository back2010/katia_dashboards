# Activo 360 · Nota de traspaso

Estado del proyecto al 12 nov 2026, para quien lo continúe (persona o Claude Code).

## Qué es

Demo funcional del proyecto LAI (Líderes de Alto Impacto) de Salud Digna. Su objetivo es reducir el rezago de equipo de cómputo sustituido en clínicas vendiéndolo localmente a colaboradores, en lugar de destruirlo. También cubre destrucción certificada y donación. Tiene un segundo módulo de inventario de Sistemas por colaborador con carta responsiva (SGC-N4-347).

- **Es un demo**, no un sistema productivo. Sirve para presentarlo a dirección y mentores, y para mostrarle a Humand cómo debería funcionar la integración.
- Si dirección lo aprueba, el desarrollo real se hace internamente. La autora original (Katia) no lo mantiene después del diplomado.
- Todos los datos son inventados. El inventario demo se genera con semilla fija y usa el formato real de la vista de equipos de AppSheet de Sistemas.

## Qué hace hoy (v9.1)

| Área | Qué hay |
|---|---|
| Datos | Inventario en formato AppSheet: 29 columnas, mismo orden. Demo: 50 clínicas, 883 registros (667 vigentes y 216 históricos). |
| Carga | Arrastrar el CSV o XLSX exportado de AppSheet, o leer un archivo de Drive desde Apps Script, con revisión cada 5 min y al volver a la pestaña. La actualización conserva el proceso de venta en curso. |
| Exportar | XLSX en formato AppSheet, con ESTATUS actualizado según la etapa (vendido → VENDIDO, etc.) y las columnas ESTATUS ACTIVO 360, PRECIO AUTORIZADO y FOLIO VENTA. |
| Flujo | Diagnóstico del ingeniero → precio (tabulador) → Bazar en Humand → compra, firma, depósito, factura y entrega. Si no se vende en 15 días: baja de precio, subasta, destrucción o donación. |
| Alertas | Vista propia, campana con contador y recuadro en el panel. Urgentes, por atender y avisos. |
| Interfaz | Estilo cristal, modo claro y oscuro, menú lateral izquierdo con logo sin fondo, saludo al abrir con nombre y hora. |
| Simulación | Fecha demo fija `T0 = 2026-10-13` y botón de cierre del día. Con datos reales, la fecha es la de hoy. |

## Reglas de negocio que no deben cambiarse sin consultarlo

- **Vida útil:** `INSTALACION + 5 años` (CPU). Alerta 3 meses antes.
- **Estatus de AppSheet al cargar:**
  - ACTIVO y RESGUARDO entran al ciclo normal.
  - PLAN DE RENOVACION / ENVIADO A CSI entra como "Por diagnosticar" (CONFIRMADO).
  - VENDIDO, DESTRUIDO y TRANSFERIDO quedan como históricos.
- **Ingeniero responsable:** la columna `USUARIO`. Si viene vacía, se usa el más frecuente de la clínica.
- **Compra:**
  - Solo colaboradores pueden comprar.
  - Al dar "Comprar" se piden los datos de factura o se elige público en general. El equipo se congela.
  - Firma el colaborador y luego su jefe inmediato, en 1 día hábil, o el equipo se libera.
  - Hay 2 días hábiles para depositar y subir el váucher.
- **Ingresos** se llama así (no Cobranza). Tiene 4 cuentas y siempre pide váucher.
- **Facturación** recibe un correo y adjunta el CFDI. **Fiscal** pertenece a Jurídico.
- **Avisos:** a compradores, jefes, Activo Fijo e Ingresos por Humand. A Sistemas, Facturación y Fiscal por correo.
- **Humand** (respuesta oficial):
  - No permite crear ni autocompletar solicitudes desde fuera.
  - Sí permite leer solicitudes de Gestión de Servicios (GET).
  - El inicio debe hacerse en un formulario de Humand.
  - Producto evalúa endpoints para aprobar desde fuera, sin fecha.
- **Montos de recuperación:** se muestran conservadores, sin sumas espectaculares.

## Pendientes conocidos

1. **No se pudo guardar el proyecto en el editor de Apps Script** ("no se puede guardar, intente más tarde"). Falló desde el primer archivo, así que no es por tamaño: el proyecto pesa unos 2.2 MB y el límite práctico ronda 10 MB. Causa probable: varias cuentas de Google abiertas en el navegador, o la red corporativa. Prueba sugerida: ventana de incógnito con una sola cuenta y proyecto creado desde Drive. **Sin confirmar.**
2. **Decisiones posteriores que esta versión todavía no implementa:**
   - El inventario vive en un Google Sheets de la cuenta corporativa de Salud Digna y el Apps Script va ligado a esa hoja, con lectura y escritura (no solo lectura de un archivo).
   - Sin exportaciones XLSX.
   - Acceso para cualquier cuenta de Salud Digna.
   - Pantalla de inicio con dos tarjetas: equipo de cómputo e inventario.
   - Inventario por colaborador con datos inventados: laptops Lenovo y HP, diademas, monitores.
3. Si se elimina la exportación XLSX, se puede quitar `vendor/xlsx.full.min.js` (1.2 MB) y Apps Script queda en 6 archivos. Revisar antes que la carga de archivos tampoco lo necesite.
4. **Fechas en CSV:** se leen como dd/mm/aaaa. Desde v9.2, `isMDY` detecta por archivo el formato de EE. UU. (mm/dd) si algún valor lo prueba (segundo número > 12) y ninguno prueba dd/mm; el resumen de carga lo avisa. Un archivo mm/dd con todas las fechas ambiguas (día ≤ 12) se sigue leyendo como dd/mm. El inventario tecnológico lee sus CSV sin `asText`, así que ahí SheetJS interpreta las fechas antes que `normDate`.
5. **Guardado del avance:** el estado se guarda en `localStorage` con la clave `activo360-v9`. Si cambia la estructura de `S`, hay que subir la versión de la clave.

## Estructura

```
activo-360/
├─ CLAUDE.md                   instrucciones para Claude Code
├─ HANDOFF.md                  este documento
├─ src/
│  ├─ shell.html               HTML base con marcadores {{STYLES}} {{LOGO}} {{SCRIPTS}}
│  ├─ styles.css               estilos (bloque cristal al final)
│  ├─ app.js                   toda la lógica (1,320 líneas, por secciones)
│  ├─ assets/logo.png          logo sin fondo
│  └─ data/
│     ├─ clinicas.json         directorio de 265 clínicas (nombre, división, zona, estado, servicios, apertura)
│     └─ appsheet_demo.json    inventario demo {cols, rows} en formato AppSheet
├─ vendor/xlsx.full.min.js     SheetJS (no editar)
├─ appscript/Code.gs           servidor de Apps Script (doGet, include, lectura del archivo en Drive)
├─ tools/
│  ├─ build.py                 src → dist/Activo360.html + dist/appscript/ (15 archivos)
│  ├─ validate.py              abre ambas versiones en Chromium y recorre todas las vistas
│  └─ gen_demo_data.py         regenera appsheet_demo.json (semilla fija)
└─ dist/                       generado; no editar a mano
```

## Cómo se publica en Apps Script

1. Ejecuta `python3 tools/build.py`.
2. Crea en Apps Script los 15 archivos de `dist/appscript/` con el mismo nombre: `Code` es de tipo Script y el resto HTML.
3. En `Code.gs`, pon en `FILE_ID` el ID del archivo de AppSheet en Drive. Vacío, usa los datos demo.
4. Ve a Implementar > Aplicación web.

Si un archivo quedó cortado al pegarlo, la página muestra un aviso rojo con su nombre.
