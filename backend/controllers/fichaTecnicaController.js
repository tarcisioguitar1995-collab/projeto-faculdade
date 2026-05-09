const db = require('../database');

function listar(req, res) {
  const produto_id = req.params.produto_id || req.params.id;
  const produto = db.prepare('SELECT * FROM produto WHERE id = ?').get(produto_id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const itens = db.prepare(`
    SELECT ft.id, ft.insumo_id, ft.quantidade_consumida,
           p.nome AS insumo_nome, p.unidade_medida
    FROM ficha_tecnica ft
    JOIN produto p ON p.id = ft.insumo_id
    WHERE ft.produto_id = ?
    ORDER BY p.nome
  `).all(produto_id);

  res.json({ produto, itens });
}

function salvar(req, res) {
  const produto_id = req.params.produto_id || req.params.id;
  const { itens } = req.body;

  const produto = db.prepare('SELECT * FROM produto WHERE id = ?').get(produto_id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erros: { itens: 'Adicione pelo menos um insumo' } });
  }

  for (const item of itens) {
    if (!item.insumo_id || !item.quantidade_consumida || item.quantidade_consumida <= 0) {
      return res.status(400).json({ erros: { itens: 'Cada insumo deve ter ID e quantidade válida' } });
    }
    const insumo = db.prepare('SELECT * FROM produto WHERE id = ?').get(item.insumo_id);
    if (!insumo) {
      return res.status(400).json({ erros: { itens: `Insumo ID ${item.insumo_id} não encontrado` } });
    }
  }

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM ficha_tecnica WHERE produto_id = ?').run(produto_id);
    const insert = db.prepare(
      'INSERT INTO ficha_tecnica (produto_id, insumo_id, quantidade_consumida) VALUES (?, ?, ?)'
    );
    for (const item of itens) {
      insert.run(produto_id, item.insumo_id, item.quantidade_consumida);
    }
  });

  transaction();

  res.json({ mensagem: 'Ficha técnica salva com sucesso!' });
}

module.exports = { listar, salvar };
