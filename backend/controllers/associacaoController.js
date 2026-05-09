const db = require('../database');

// lista os fornecedores de um produto
function fornecedoresDoProduto(req, res) {
  const produto = db.prepare('SELECT id FROM produto WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const fornecedores = db.prepare(`
    SELECT f.* FROM fornecedor f
    INNER JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
    WHERE pf.produto_id = ?
    ORDER BY f.nome
  `).all(req.params.id);

  res.json(fornecedores);
}

// lista os produtos de um fornecedor
function produtosDoFornecedor(req, res) {
  const fornecedor = db.prepare('SELECT id FROM fornecedor WHERE id = ?').get(req.params.id);
  if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

  const produtos = db.prepare(`
    SELECT p.* FROM produto p
    INNER JOIN produto_fornecedor pf ON pf.produto_id = p.id
    WHERE pf.fornecedor_id = ?
    ORDER BY p.nome
  `).all(req.params.id);

  res.json(produtos);
}

// associa um fornecedor a um produto
function associar(req, res) {
  const { id } = req.params; // produto_id
  const { fornecedor_id } = req.body;

  if (!fornecedor_id) {
    return res.status(400).json({ erro: 'fornecedor_id é obrigatório' });
  }

  const produto = db.prepare('SELECT id FROM produto WHERE id = ?').get(id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const fornecedor = db.prepare('SELECT id FROM fornecedor WHERE id = ?').get(fornecedor_id);
  if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

  // verifica se já está associado
  const ja = db.prepare(`
    SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?
  `).get(id, fornecedor_id);

  if (ja) {
    return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  }

  db.prepare(`
    INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)
  `).run(id, fornecedor_id);

  res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
}

// desassocia
function desassociar(req, res) {
  const { id, fornecedorId } = req.params;
  const result = db.prepare(`
    DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?
  `).run(id, fornecedorId);

  if (result.changes === 0) {
    return res.status(404).json({ erro: 'Associação não encontrada' });
  }

  res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
}

module.exports = { fornecedoresDoProduto, produtosDoFornecedor, associar, desassociar };
