# AGENTS.md — katia_dashboards

Guía para agentes de IA (Codex, Claude) que escriben o revisan código en este repo.

## Contexto
Dashboards y herramientas internas para operación de una red de clínicas (Salud Digna) y una clínica de primer nivel. Usuarios: personal operativo y médico, a menudo en tablet y con conectividad limitada.

## Reglas de arquitectura (obligatorias)
- Cada dashboard es **un solo archivo HTML autocontenido**: HTML + CSS + JS inline.
- **Sin servidor.** Debe funcionar abriendo el archivo local (`file://`).
- **Sin dependencias externas en runtime**: nada de CDN, fuentes remotas, `fetch` a APIs ni imágenes remotas. Si se necesita una librería, va embebida.
- Debe funcionar **offline**.
- Responsive: usable en tablet (≥768 px) y escritorio.
- Modo claro y oscuro.
- **Excepción, proyectos grandes publicados en Apps Script** (ej. `activo-360/`): el código fuente se separa en `src/` y un `tools/build.py` genera el HTML único y los archivos de Apps Script en `dist/`. El único "servidor" es Apps Script (`doGet` + `include`). Se edita `src/`, nunca `dist/` a mano. Archivos de Apps Script sin caracteres de control, sin BOM y en partes pequeñas para pegarlos sin errores.

## Datos
- **Prohibido subir datos reales de pacientes** (nombres, CURP, NSS, teléfonos, expedientes, notas clínicas). Solo datos de prueba ficticios.
- Tampoco datos reales de Salud Digna: exportaciones de AppSheet, nombres de colaboradores o ingenieros, correos. Usa datos inventados con un generador de semilla fija.
- Si el código maneja datos sensibles, que no los persista fuera del navegador ni los envíe a ningún lado.
- `localStorage` solo envuelto en `try/catch`; la página debe funcionar si falla.

## Qué revisar con prioridad (P0/P1)
1. Violaciones de las reglas de arquitectura (dependencias externas, llamadas de red).
2. Cálculos incorrectos en indicadores, porcentajes, metas, rankings o fechas (zona horaria America/Mazatlan).
3. Datos de pacientes o credenciales en el repo.
4. Errores de JS que rompan la carga o dejen la vista en blanco.
5. Inyección de HTML (`innerHTML` con datos sin escapar).

## Estilo
- Interfaz y textos en español.
- Validaciones/scripts de soporte en Python, no Node.
- Respuestas breves y directas, sin narrar pasos.
- Cambios mínimos y localizados, con reemplazos exactos usando el texto de alrededor como ancla; no reescribir archivos completos sin motivo.
- Cambios en una rama propia y por pull request a `main`; Codex revisa los PR.
- Si la carpeta tiene `CLAUDE.md` o `HANDOFF.md`, léelo antes de cambiar algo.

## Estructura
```
katia_dashboards/
├── AGENTS.md
├── README.md                  # índice de proyectos
├── activo-360/                # demo LAI; src/ → tools/build.py → dist/ (HTML único + Apps Script)
├── turnero/
├── digital-expert/
├── recuperacion-pacientes/
├── fallas-sistema-usg/        # Apps Script (.gs + .html)
├── hub-mi-espacio/            # Apps Script
├── diplomado-ultrasonido/
├── imss-formatos/             # herramienta offline consulta
└── _compartido/               # estilos/utilidades reutilizables (copiar inline, no enlazar)
```
- Cada carpeta: `index.html` (o `.gs` en Apps Script) + `README.md` breve (qué hace, de dónde salen los datos).
- Datos de prueba en `<proyecto>/datos-prueba/`. Nunca datos reales.
- Archivos sueltos en la raíz no se aceptan, salvo `AGENTS.md` y `README.md`.
