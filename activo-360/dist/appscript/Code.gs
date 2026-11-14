/**
 * Activo 360 · Apps Script
 * Archivos del proyecto: Code.gs, Index.html, App.html, Datos.html, Xlsx.html
 *
 * Conexión con el archivo de AppSheet en Drive:
 *   1. Sube a Drive el archivo de equipos (.xlsx, .xls, .csv o Google Sheets) con los encabezados de AppSheet.
 *   2. Copia su ID (la parte entre /d/ y /view o /edit del enlace) en FILE_ID.
 *   3. Implementar > Nueva implementación > Aplicación web (o Administrar implementaciones > Editar > Nueva versión).
 * Cada vez que el archivo cambie en Drive (lo reemplazas, lo editas o "Administrar versiones"),
 * la herramienta lo detecta al abrir, al volver a la pestaña y cada POLL_MIN minutos, y se actualiza sola.
 * Si FILE_ID queda vacío, funciona con los datos demo de Datos.html.
 */
const CONFIG = {
  FILE_ID: '',      // ID del archivo en Drive; vacío = la hoja a la que está ligado este script
  SHEET_NAME: '',   // pestaña a leer; vacío = la primera (en "Activo 360 data" es INVENTARIO)
  POLL_MIN: 5,      // cada cuántos minutos revisa si el archivo cambió
  SIMULAR_VENTAS: true  // demo: al cargar la hoja, agrega ventas de ejemplo sobre esos equipos para que el panel muestre números
};

/** Archivo del inventario: FILE_ID o, si está vacío, el Sheets que contiene este script. */
function feedId_() {
  if (CONFIG.FILE_ID) return CONFIG.FILE_ID;
  try { const ss = SpreadsheetApp.getActiveSpreadsheet(); return ss ? ss.getId() : ''; } catch (e) { return ''; }
}

function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  t.feedOn = !!feedId_();
  t.pollMin = CONFIG.POLL_MIN;
  t.simOn = !!CONFIG.SIMULAR_VENTAS;
  t.userName = nombreUsuario_();
  return t.evaluate()
    .setTitle('Activo 360')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Nombre para el saludo, a partir del correo (katia.barraza@... -> Katia). */
function nombreUsuario_() {
  try {
    const mail = Session.getActiveUser().getEmail() || '';
    const n = mail.split('@')[0].split(/[._-]/)[0];
    return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : '';
  } catch (e) { return ''; }
}

/** Datos del archivo para saber si cambió (se consulta cada POLL_MIN minutos). */
function getFeedInfo() {
  if (!feedId_()) return { ok: false, msg: 'Configura FILE_ID en Code.gs con el ID de la hoja de inventario' };
  const f = DriveApp.getFileById(feedId_());
  const mime = f.getMimeType();
  if (mime === MimeType.GOOGLE_SHEETS) {
    // Huella solo de la pestaña del inventario: escribir en "Traza" no debe recargar el inventario.
    const ss = SpreadsheetApp.openById(feedId_());
    const sh = CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
    const dig = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, JSON.stringify(sh ? sh.getDataRange().getValues() : []));
    return { ok: true, name: f.getName(), mime: mime, updated: Utilities.base64Encode(dig) };
  }
  return { ok: true, name: f.getName(), mime: mime, updated: f.getLastUpdated().getTime() };
}

/** Contenido del archivo: Google Sheets -> filas; Excel/CSV -> archivo en base64 (lo lee el navegador). */
function getFeedData() {
  const f = DriveApp.getFileById(feedId_());
  const mime = f.getMimeType();
  if (mime === MimeType.GOOGLE_SHEETS) {
    const ss = SpreadsheetApp.openById(feedId_());
    const sh = CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
    if (!sh) throw new Error('No existe la pestaña "' + CONFIG.SHEET_NAME + '"');
    const tz = ss.getSpreadsheetTimeZone();
    const vals = sh.getDataRange().getValues();
    const head = vals.shift().map(h => String(h).trim());
    const rows = vals.filter(r => r.some(v => v !== '' && v !== null)).map(r => {
      const o = {};
      head.forEach((h, i) => {
        if (!h) return;
        const v = r[i];
        o[h] = v instanceof Date ? Utilities.formatDate(v, tz, /MODIFICADO/i.test(h) ? 'dd/MM/yyyy HH:mm:ss' : 'dd/MM/yyyy') : String(v);
      });
      return o;
    });
    return { rows: rows, name: f.getName(), mime: mime };
  }
  return { b64: Utilities.base64Encode(f.getBlob().getBytes()), name: f.getName(), mime: mime, sheet: CONFIG.SHEET_NAME };
}

/* ================= Traza en Google Sheets =================
 * Cada evento del proceso (diagnóstico, precio, compra, firmas, depósito, factura, entrega...) se agrega
 * como una fila en la pestaña "Traza". Solo para el demo: los datos son inventados.
 * La pestaña "Traza" se crea dentro del mismo Sheets del inventario; la pestaña del inventario no se toca.
 * Archivo que se usa, en este orden:
 *   1. TRAZA_ID, si lo llenas (ID de otro Google Sheets).
 *   2. La hoja a la que está ligado este script (Extensiones > Apps Script desde la hoja del inventario).
 *   3. CONFIG.FILE_ID, si es un Google Sheets.
 *   4. Si no hay ninguno, se crea "Activo 360 · Traza (demo)" en tu Drive y se recuerda su ID.
 */
const TRAZA = {
  TRAZA_ID: '',     // opcional
  PESTANA: 'Traza',
  COLS: ['Registrado', 'Fecha del demo', 'Folio', 'ID activo', 'Equipo', 'Clínica', 'Etapa', 'Responsable', 'Dónde', 'Evento', 'Origen']
};

function trazaHoja_() {
  let ss = null;
  if (TRAZA.TRAZA_ID) ss = SpreadsheetApp.openById(TRAZA.TRAZA_ID);
  if (!ss) { try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; } }
  if (!ss && CONFIG.FILE_ID) {
    try { if (DriveApp.getFileById(CONFIG.FILE_ID).getMimeType() === MimeType.GOOGLE_SHEETS) ss = SpreadsheetApp.openById(CONFIG.FILE_ID); } catch (e) { ss = null; }
  }
  if (!ss) {
    const props = PropertiesService.getScriptProperties();
    const id = props.getProperty('TRAZA_ID');
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
    if (!ss) { ss = SpreadsheetApp.create('Activo 360 · Traza (demo)'); props.setProperty('TRAZA_ID', ss.getId()); }
  }
  let sh = ss.getSheetByName(TRAZA.PESTANA);
  if (!sh) {
    sh = ss.insertSheet(TRAZA.PESTANA, ss.getNumSheets()); // al final: la primera pestaña sigue siendo el inventario
    sh.getRange(1, 1, 1, TRAZA.COLS.length).setValues([TRAZA.COLS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return { ss: ss, sh: sh };
}

/** Agrega filas a la traza. rows: arreglo de arreglos de texto, sin la columna "Registrado". */
function appendTraza(rows) {
  if (!rows || !rows.length) return { ok: true, n: 0 };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const t = trazaHoja_();
    const now = Utilities.formatDate(new Date(), t.ss.getSpreadsheetTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    const n = TRAZA.COLS.length;
    const vals = rows.map(r => [now].concat(r.slice(0, n - 1).map(v => String(v == null ? '' : v))).concat(Array(Math.max(0, n - 1 - r.length)).fill('')));
    t.sh.getRange(t.sh.getLastRow() + 1, 1, vals.length, n).setValues(vals);
    return { ok: true, n: vals.length, url: t.ss.getUrl() + '#gid=' + t.sh.getSheetId() };
  } finally { lock.releaseLock(); }
}

/** Traza de un equipo (por ID activo) o de un folio. Devuelve solo texto. */
function getTraza(id) {
  const t = trazaHoja_();
  const url = t.ss.getUrl() + '#gid=' + t.sh.getSheetId();
  const last = t.sh.getLastRow();
  if (last < 2) return { ok: true, url: url, rows: [] };
  const tz = t.ss.getSpreadsheetTimeZone();
  const vals = t.sh.getRange(2, 1, last - 1, TRAZA.COLS.length).getValues();
  const key = String(id || '').trim();
  const rows = vals.filter(r => !key || String(r[3]) === key || String(r[2]) === key)
    .map(r => r.map(v => v instanceof Date ? Utilities.formatDate(v, tz, 'dd/MM/yyyy HH:mm:ss') : String(v)));
  return { ok: true, url: url, rows: rows };
}

/* ================= Ingenieros y clínicas =================
 * Pestaña "Ingenieros" del mismo Sheets: ID | Nombre | Correo | Clínicas (separadas por " | ").
 * Si el correo de quien entra coincide con un ingeniero, la herramienta abre en su perfil (solo sus clínicas).
 */
const ING_COLS = ['ID', 'Nombre', 'Correo', 'Clínicas'];
function ingHoja_() {
  const ss = trazaHoja_().ss;
  let sh = ss.getSheetByName('Ingenieros');
  if (!sh) {
    sh = ss.insertSheet('Ingenieros', ss.getNumSheets());
    sh.getRange(1, 1, 1, ING_COLS.length).setValues([ING_COLS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function getIngenieros() {
  let email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch (e) {}
  const sh = ingHoja_(), last = sh.getLastRow();
  const rows = last < 2 ? [] : sh.getRange(2, 1, last - 1, ING_COLS.length).getValues().filter(r => r[0] && r[1]).map(r => r.map(String));
  return { rows: rows, email: email };
}
function saveIngenieros(rows) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = ingHoja_(), last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, ING_COLS.length).clearContent();
    if (rows && rows.length) sh.getRange(2, 1, rows.length, ING_COLS.length).setValues(rows.map(r => ING_COLS.map((_, i) => String(r[i] == null ? '' : r[i]))));
    return { ok: true, n: rows ? rows.length : 0 };
  } finally { lock.releaseLock(); }
}
