const { getDb } = require('../db');

function listar() {
  return getDb().prepare(`
    SELECT id, categoria_id, nome, preco, imagem, descricao, ingredientes, pedido_texto, ativo, created_at
    FROM produtos ORDER BY id ASC
  `).all();
}

function buscarPorId(id) {
  return getDb().prepare(`
    SELECT id, categoria_id, nome, preco, imagem, descricao, ingredientes, pedido_texto, ativo, created_at
    FROM produtos WHERE id = ?
  `).get(Number(id)) || null;
}

function inserir(row) {
  const db = getDb();
  const r = db.prepare(`
    INSERT INTO produtos (categoria_id, nome, preco, imagem, descricao, ingredientes, pedido_texto, ativo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.categoria_id != null ? Number(row.categoria_id) : null,
    row.nome,
    Number(row.preco) || 0,
    row.imagem || null,
    row.descricao || null,
    row.ingredientes || null,
    row.pedido_texto || null,
    row.ativo === 0 ? 0 : 1
  );
  const lid = Number(r.lastInsertRowid);
  return buscarPorId(lid);
}

function atualizar(id, patch) {
  if (!buscarPorId(id)) return null;
  const sets = [];
  const vals = [];
  const fields = ['categoria_id', 'nome', 'preco', 'imagem', 'descricao', 'ingredientes', 'pedido_texto', 'ativo'];
  fields.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      sets.push(`${k} = ?`);
      let v = patch[k];
      if (k === 'preco') v = Number(v) || 0;
      else if (k === 'categoria_id') v = v != null ? Number(v) : null;
      else if (k === 'ativo') v = v === 0 || v === false ? 0 : 1;
      vals.push(v);
    }
  });
  if (!sets.length) return buscarPorId(id);
  vals.push(Number(id));
  getDb().prepare(`UPDATE produtos SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return buscarPorId(id);
}

function deletar(id) {
  const r = getDb().prepare('DELETE FROM produtos WHERE id = ?').run(Number(id));
  return Number(r.changes) > 0;
}

module.exports = {
  listar,
  buscarPorId,
  inserir,
  atualizar,
  deletar
};
