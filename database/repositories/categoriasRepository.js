const { getDb } = require('../db');

function listar() {
  return getDb().prepare(
    'SELECT id, nome, slug, ordem, created_at FROM categorias ORDER BY ordem ASC, id ASC'
  ).all();
}

function buscarPorId(id) {
  return getDb().prepare(
    'SELECT id, nome, slug, ordem, created_at FROM categorias WHERE id = ?'
  ).get(Number(id)) || null;
}

function inserir(row) {
  const db = getDb();
  const r = db.prepare(`
    INSERT INTO categorias (nome, slug, ordem)
    VALUES (?, ?, ?)
  `).run(row.nome, row.slug, Number(row.ordem) || 0);
  return buscarPorId(Number(r.lastInsertRowid));
}

function atualizar(id, patch) {
  const cur = buscarPorId(id);
  if (!cur) return null;
  const nome = patch.nome != null ? patch.nome : cur.nome;
  const slug = patch.slug != null ? patch.slug : cur.slug;
  const ordem = patch.ordem != null ? Number(patch.ordem) : cur.ordem;
  getDb().prepare(`
    UPDATE categorias SET nome = ?, slug = ?, ordem = ? WHERE id = ?
  `).run(nome, slug, ordem, Number(id));
  return buscarPorId(id);
}

function deletar(id) {
  const r = getDb().prepare('DELETE FROM categorias WHERE id = ?').run(Number(id));
  return Number(r.changes) > 0;
}

module.exports = {
  listar,
  buscarPorId,
  inserir,
  atualizar,
  deletar
};
