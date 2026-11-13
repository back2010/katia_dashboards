# Activo 360 · instrucciones para Claude Code

Lee `HANDOFF.md` primero: contexto, reglas de negocio y pendientes.

## Forma de trabajar
- Responde en español, breve y directo, sin narrar.
- Edita con reemplazos exactos (`str_replace` / Edit) usando contexto alrededor como ancla; no reescribas archivos completos.
- Valida con Python (`python3 tools/validate.py`), no con Node.
- Restricción de arquitectura: HTML autocontenido, sin servidor propio y sin dependencias externas en tiempo de ejecución (nada de CDN). Apps Script es el único "servidor".

## Fuente de verdad
- Edita solo `src/`, `appscript/Code.gs` y `tools/`. `dist/` se genera.
- No edites `vendor/xlsx.full.min.js`.
- Después de cada cambio: `python3 tools/build.py && python3 tools/validate.py` (debe salir "sin errores" en las dos versiones).
- Datos demo: `python3 tools/gen_demo_data.py` (semilla fija). Nunca subas datos reales de AppSheet al repo.

## Mapa de `src/app.js`
| Líneas aprox. | Sección |
|---|---|
| 1–65 | constantes, catálogos, estados `ST` |
| 66–111 | adaptador AppSheet: `mapAS` (filas → equipos), `asStatus` (etapa → ESTATUS), `asExportRows` |
| 112–174 | saludo (`greet`, `welcome`), `alerts()`, Drive (`syncFeed`, `mergeFeed`, `feedLoad`) |
| 175–209 | `init` / estado global `S` |
| 210–245 | tabulador `priceCalc` y diagnóstico |
| 299–404 | flujo de venta, `seed()` del demo, cierre diario |
| 405–458 | persistencia (`KEY='activo360-v9'`), helpers UI, `NAVS`, `go`, `render` |
| 459–1304 | vistas: `VIEWS.<id>` arma HTML, `after.<id>` conecta eventos |
| 1305–fin | eventos globales y arranque (`load(); render(); welcome();`) |

Para agregar una vista: `VIEWS.x=()=>'html'`, `after.x=()=>{...}`, agregar `['x','Nombre']` en `NAVS` y el id en `MODV` del módulo.

## Reglas para no romper Apps Script
- `build.py` divide `app.js` en App1/App2/App3 por las líneas que empiezan con `/* ================= INVENTARIO (formato` y `/* ================= INVENTARIO TECNOL`. No renombres esos comentarios.
- Cada parte se carga en su propio `<script>`: el código de nivel superior de App1 no puede llamar funciones definidas en App2 o App3 al momento de cargar.
- Sin BOM ni `<!--` en `app.js` (build lo verifica).
- En `Index` solo hay scriptlets `<?!= ... ?>`; no metas `<?` en `shell.html`.
- `google.script.run` solo devuelve primitivos: las fechas viajan como texto dd/MM/yyyy.
