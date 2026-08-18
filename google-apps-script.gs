/**
 * Backend do Piquenique do Henri — Wizard v2.
 *
 * COMO ATUALIZAR NO GOOGLE APPS SCRIPT
 * 1. Substitua todo o conteúdo do Code.gs por este arquivo.
 * 2. Salve.
 * 3. Vá em Implantar > Gerenciar implantações.
 * 4. Edite a implantação atual e selecione "Nova versão".
 * 5. Implante novamente. A URL /exec permanece a mesma.
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
    if (nome.length < 2) return jsonResponse({ ok: false, error: 'Nome inválido.' });

    const legacyAcompanhantes = clampInt(payload.acompanhantes, 0, 29);
    const totalInformado = clampInt(payload.totalPessoas, 0, 30);
    const total = totalInformado >= 1 ? totalInformado : 1 + legacyAcompanhantes;
    const criancas = clampInt(payload.criancas, 0, total);
    const adultos = Math.max(0, total - criancas);

    const beerRaw = payload.bebemCerveja !== undefined ? payload.bebemCerveja : payload.bebemChopp;
    const bebemCerveja = clampInt(beerRaw, 0, adultos);
    const bebemEspumante = clampInt(payload.bebemEspumante, 0, adultos);
    const acompanhantes = Math.max(0, total - 1);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    ensureHeader(sheet);

    // K:M ficam reservadas aos registros antigos de estimativa de cerveja.
    sheet.appendRow([
      new Date(),
      Utilities.getUuid(),
      nome,
      acompanhantes,
      criancas,
      total,
      String(payload.origem || ''),
      String(payload.enviadoEm || ''),
      adultos,
      bebemCerveja,
      '',
      '',
      '',
      bebemEspumante
    ]);

    return jsonResponse({ ok: true, nome, totalPessoas: total, criancas, adultos, bebemCerveja, bebemEspumante });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: 'Falha ao registrar.' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'Piquenique do Henri RSVP', version: 'wizard-cerveja-espumante-2026-08-18' });
}

function ensureHeader(sheet) {
  const headers = [[
    'Registrado em',
    'ID',
    'Nome',
    'Acompanhantes (legado)',
    'Crianças',
    'Total de pessoas',
    'Origem',
    'Enviado pelo navegador em',
    'Adultos',
    'Bebem cerveja',
    'Latinhas de 350 ml por pessoa (legado)',
    'Estimativa de latinhas 350 ml (legado)',
    'Estimativa de cerveja (L) (legado)',
    'Bebem espumante'
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
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
