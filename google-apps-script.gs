/**
 * Backend do Piquenique do Henri.
 *
 * 1. Crie uma planilha no Google Sheets.
 * 2. Copie o ID da planilha e substitua SHEET_ID.
 * 3. No Apps Script, implante como Aplicativo da Web.
 * 4. Execute como você e permita acesso para qualquer pessoa.
 * 5. Copie a URL /exec para config.js.
 */

const SHEET_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
const SHEET_NAME = 'Presencas';

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Campo invisível usado como honeypot anti-bot.
    if (payload.website) return jsonResponse({ ok: true });

    const nome = String(payload.nome || '').trim().replace(/\s+/g, ' ');
    const acompanhantes = clampInt(payload.acompanhantes, 0, 20);
    const criancas = clampInt(payload.criancas, 0, 20);

    if (nome.length < 2) return jsonResponse({ ok: false, error: 'Nome inválido.' });
    if (criancas > acompanhantes) return jsonResponse({ ok: false, error: 'Número de crianças inválido.' });

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    ensureHeader(sheet);

    const total = 1 + acompanhantes;
    sheet.appendRow([
      new Date(),
      Utilities.getUuid(),
      nome,
      acompanhantes,
      criancas,
      total,
      String(payload.origem || ''),
      String(payload.enviadoEm || '')
    ]);

    return jsonResponse({ ok: true, nome, acompanhantes, criancas, totalPessoas: total });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: 'Falha ao registrar.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'Piquenique do Henri RSVP' });
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() > 0) return;

  const headers = [[
    'Registrado em',
    'ID',
    'Nome',
    'Acompanhantes',
    'Crianças entre acompanhantes',
    'Total de pessoas',
    'Origem',
    'Enviado pelo navegador em'
  ]];

  const range = sheet.getRange(1, 1, 1, headers[0].length);
  range.setValues(headers);
  range.setFontWeight('bold');
  range.setBackground('#0b4aa0');
  range.setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers[0].length);
}

function clampInt(value, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
