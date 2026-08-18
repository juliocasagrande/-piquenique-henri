/**
 * Backend do Piquenique do Henri.
 *
 * Planilha já configurada neste arquivo.
 * No Apps Script, implante como Aplicativo da Web, execute como você
 * e permita acesso para qualquer pessoa. Depois copie a URL /exec
 * para o config.js do site.
 */

const SHEET_ID = '1-sVefrkdOoPvH_clSj4s3_bqkxoj5MmgKUlSzRegIDQ';
const SHEET_NAME = 'Presencas';

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (payload.website) return jsonResponse({ ok: true });

    const nome = String(payload.nome || '').trim().replace(/\s+/g, ' ');
    const acompanhantes = clampInt(payload.acompanhantes, 0, 20);
    const criancas = clampInt(payload.criancas, 0, acompanhantes);
    const total = 1 + acompanhantes;
    const adultos = total - criancas;
    const homensAdultos = clampInt(payload.homensAdultos, 0, adultos);
    const mulheresAdultas = adultos - homensAdultos;
    const bebemChopp = clampInt(payload.bebemChopp, 0, adultos);

    if (nome.length < 2) return jsonResponse({ ok: false, error: 'Nome inválido.' });

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    ensureHeader(sheet);

    sheet.appendRow([
      new Date(),
      Utilities.getUuid(),
      nome,
      acompanhantes,
      criancas,
      total,
      String(payload.origem || ''),
      String(payload.enviadoEm || ''),
      homensAdultos,
      mulheresAdultas,
      bebemChopp
    ]);

    return jsonResponse({
      ok: true,
      nome,
      acompanhantes,
      criancas,
      totalPessoas: total,
      adultos,
      homensAdultos,
      mulheresAdultas,
      bebemChopp
    });
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
  const headers = [[
    'Registrado em',
    'ID',
    'Nome',
    'Acompanhantes',
    'Crianças entre acompanhantes',
    'Total de pessoas',
    'Origem',
    'Enviado pelo navegador em',
    'Homens adultos',
    'Mulheres adultas',
    'Bebem chopp'
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