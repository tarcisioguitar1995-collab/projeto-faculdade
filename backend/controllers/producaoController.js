const db = require('../database');

function registrar(req, res) {
  const { produto_id, quantidade_produzida } = req.body;

  if (!produto_id || !quantidade_produzida || quantidade_produzida <= 0) {
    return res.status(400).json({ erros: { campos: 'produto_id e quantidade_produzida (positiva) são obrigatórios' } });
  }

  const produto = db.prepare('SELECT * FROM produto WHERE id = ?').get(produto_id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const insumos = db.prepare(`
    SELECT ft.insumo_id, ft.quantidade_consumida, p.nome, p.quantidade AS estoque_atual, p.estoque_minimo
    FROM ficha_tecnica ft
    JOIN produto p ON p.id = ft.insumo_id
    WHERE ft.produto_id = ?
  `).all(produto_id);

  if (insumos.length === 0) {
    return res.status(400).json({ erro: 'Produto não possui ficha técnica cadastrada' });
  }

  const faltantes = [];
  for (const insumo of insumos) {
    const necessario = insumo.quantidade_consumida * quantidade_produzida;
    if (insumo.estoque_atual < necessario) {
      faltantes.push({
        insumo_id: insumo.insumo_id,
        nome: insumo.nome,
        disponivel: insumo.estoque_atual,
        necessario
      });
    }
  }

  if (faltantes.length > 0) {
    return res.status(400).json({
      erro: 'Estoque insuficiente para produção',
      faltantes
    });
  }

  const transaction = db.transaction(() => {
    const updateInsumo = db.prepare('UPDATE produto SET quantidade = quantidade - ? WHERE id = ?');
    for (const insumo of insumos) {
      const necessario = insumo.quantidade_consumida * quantidade_produzida;
      updateInsumo.run(necessario, insumo.insumo_id);
    }

    db.prepare(
      'INSERT INTO producao (produto_id, quantidade_produzida) VALUES (?, ?)'
    ).run(produto_id, quantidade_produzida);
  });

  transaction();

  const alertas = [];
  for (const insumo of insumos) {
    const novoEstoque = insumo.estoque_atual - (insumo.quantidade_consumida * quantidade_produzida);
    if (novoEstoque <= insumo.estoque_minimo) {
      alertas.push({
        insumo_id: insumo.insumo_id,
        nome: insumo.nome,
        estoque_atual: novoEstoque,
        estoque_minimo: insumo.estoque_minimo
      });
    }
  }

  const resposta = { mensagem: 'Produção registrada com sucesso!' };
  if (alertas.length > 0) {
    resposta.alertas = alertas;
  }
  res.json(resposta);
}

module.exports = { registrar };
