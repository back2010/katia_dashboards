# Reglas del repo (Claude Code y Codex)

Dashboards y herramientas internas de Katia. Estas reglas aplican a cualquier agente que trabaje aquí.

## Organización
- Una carpeta por proyecto en la raíz (ej. `activo-360/`). Cada carpeta tiene su propio `CLAUDE.md` o `HANDOFF.md` con contexto y comandos: léelo antes de cambiar algo.
- Nada de archivos sueltos en la raíz salvo `README.md` y este `AGENTS.md`.

## Forma de trabajar
- Responde en español, breve y directo. Sin narrar pasos.
- Edita con reemplazos exactos, usando el texto de alrededor como ancla. No reescribas archivos completos si no hace falta.
- Valida con scripts de Python (Playwright de Python para probar páginas), no con Node.
- Cambios en una rama propia y por pull request a `main`; Codex revisa los PR.

## Arquitectura de los dashboards
- HTML autocontenido: sin servidor propio y sin dependencias externas en tiempo de ejecución (nada de CDN). Librerías, imágenes y datos van dentro del proyecto.
- Cuando se publican en Apps Script, el único "servidor" es Apps Script (`doGet` + `include`). Archivos de Apps Script sin caracteres de control, sin BOM y en partes pequeñas para pegarlos sin errores.
- Modo claro y oscuro en todos.

## Datos
- Nunca subas datos reales de Salud Digna (exportaciones de AppSheet, nombres de pacientes, colaboradores, correos). Usa datos inventados con un generador de semilla fija.
