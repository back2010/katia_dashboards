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
  FILE_ID: '',      // ID del archivo en Drive
  SHEET_NAME: '',   // pestaña a leer; vacío = la primera
  POLL_MIN: 5       // cada cuántos minutos revisa si el archivo cambió
};

function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  t.feedOn = !!CONFIG.FILE_ID;
  t.pollMin = CONFIG.POLL_MIN;
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
  if (!CONFIG.FILE_ID) return { ok: false, msg: 'Configura FILE_ID en Code.gs con el ID del archivo de AppSheet en Drive' };
  const f = DriveApp.getFileById(CONFIG.FILE_ID);
  return { ok: true, name: f.getName(), mime: f.getMimeType(), updated: f.getLastUpdated().getTime() };
}

/** Contenido del archivo: Google Sheets -> filas; Excel/CSV -> archivo en base64 (lo lee el navegador). */
function getFeedData() {
  const f = DriveApp.getFileById(CONFIG.FILE_ID);
  const mime = f.getMimeType();
  if (mime === MimeType.GOOGLE_SHEETS) {
    const ss = SpreadsheetApp.openById(CONFIG.FILE_ID);
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
