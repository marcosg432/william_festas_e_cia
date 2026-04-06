const { getDb } = require('../db');

function listar() {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, payload, created_at, updated_at FROM orcamentos ORDER BY id DESC'
  ).all();
  return rows.map((r) => JSON.parse(r.payload));
}

function buscarPorId(id) {
  const db = getDb();
  const row = db.prepare('SELECT payload FROM orcamentos WHERE id = ?').get(Number(id));
  if (!row) return null;
  return JSON.parse(row.payload);
}

function inserir(obj) {
  const db = getDb();
  const id = Number(obj.id);
  if (!id || Number.isNaN(id)) {
    throw new Error('orçamento.id numérico obrigatório');
  }
  const payload = JSON.stringify(obj);
  const now = new Date().toISOString();
  const created = obj.data_criacao || obj.data || now;
  db.prepare(`
    INSERT INTO orcamentos (id, payload, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(id, payload, created, now);
  return buscarPorId(id);
}

function atualizar(id, patch) {
  const atual = buscarPorId(id);
  if (!atual) return null;
  const merged = Object.assign({}, atual, patch);
  merged.id = Number(id);
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE orcamentos SET payload = ?, updated_at = ? WHERE id = ?
  `).run(JSON.stringify(merged), now, Number(id));
  return buscarPorId(id);
}

function substituir(obj) {
  const id = Number(obj.id);
  if (!id) throw new Error('id inválido');
  const db = getDb();
  const now = new Date().toISOString();
  const payload = JSON.stringify(obj);
  const created = obj.data_criacao || obj.data || now;
  db.prepare(`
    INSERT INTO orcamentos (id, payload, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `).run(id, payload, created, now);
  return buscarPorId(id);
}

function deletar(id) {
  const db = getDb();
  const r = db.prepare('DELETE FROM orcamentos WHERE id = ?').run(Number(id));
  return Number(r.changes) > 0;
}

module.exports = {
  listar,
  buscarPorId,
  inserir,
  atualizar,
  substituir,
  deletar
};
