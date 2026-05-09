const db = require('../database');

const UNIDADES = ['g', 'ml', 'un'];

function validarCampos(dados) {
  const { nome, descricao, categoria } = dados;
  const erros = {};
  if (!nome) erros.nome = 'Nome é obrigatório';
  if (!descricao) erros.descricao = 'Descrição é obrigatória';
  if (!categoria) erros.categoria = 'Categoria é obrigatória';
  if (dados.unidade_medida && !UNIDADES.includes(dados.unidade_medida)) {
    erros.unidade_medida = 'Unidade de medida deve ser g, ml ou un';
  }
  return erros;
}

function listar(req, res) {
  const produtos = db.prepare('SELECT * FROM produto ORDER BY nome').all();
  res.json(produtos);
}

function buscar(req, res) {
  const p = db.prepare('SELECT * FROM produto WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(p);
}

function criar(req, res) {
  const erros = validarCampos(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  const { nome, codigo_barras, descricao, quantidade, estoque_minimo, unidade_medida, categoria, data_validade, imagem } = req.body;

  // verifica código de barras duplicado (se informado)
  if (codigo_barras) {
    const existente = db.prepare('SELECT id FROM produto WHERE codigo_barras = ?').get(codigo_barras);
    if (existente) {
      return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
    }
  }

  const result = db.prepare(`
    INSERT INTO produto (nome, codigo_barras, descricao, quantidade, estoque_minimo, unidade_medida, categoria, data_validade, imagem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nome,
    codigo_barras || null,
    descricao,
    quantidade || 0,
    estoque_minimo || 0,
    unidade_medida || 'un',
    categoria,
    data_validade || null,
    imagem || null
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    mensagem: 'Produto cadastrado com sucesso!'
  });
}

function atualizar(req, res) {
  const { id } = req.params;
  const existente = db.prepare('SELECT * FROM produto WHERE id = ?').get(id);
  if (!existente) return res.status(404).json({ erro: 'Produto não encontrado' });

  const erros = validarCampos(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  const { nome, codigo_barras, descricao, quantidade, estoque_minimo, unidade_medida, categoria, data_validade, imagem } = req.body;

  if (codigo_barras && codigo_barras !== existente.codigo_barras) {
    const outro = db.prepare('SELECT id FROM produto WHERE codigo_barras = ? AND id != ?').get(codigo_barras, id);
    if (outro) {
      return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
    }
  }

  db.prepare(`
    UPDATE produto SET nome=?, codigo_barras=?, descricao=?, quantidade=?, estoque_minimo=?, unidade_medida=?, categoria=?, data_validade=?, imagem=?
    WHERE id=?
  `).run(
    nome,
    codigo_barras || null,
    descricao,
    quantidade || 0,
    estoque_minimo || 0,
    unidade_medida || 'un',
    categoria,
    data_validade || null,
    imagem || null,
    id
  );

  res.json({ mensagem: 'Produto atualizado com sucesso!' });
}

function remover(req, res) {
  const result = db.prepare('DELETE FROM produto WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  res.json({ mensagem: 'Produto removido com sucesso!' });
}

module.exports = { listar, buscar, criar, atualizar, remover };
