const db = require('../database');

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cnpjValido(cnpj) {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  const calcDigito = (digitos, pesos) => {
    const soma = digitos.reduce((acc, d, i) => acc + d * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digitos = cnpjLimpo.split('').map(Number);
  const digito1 = calcDigito(digitos.slice(0, 12), pesos1);
  if (digito1 !== digitos[12]) return false;

  const digito2 = calcDigito(digitos.slice(0, 13), pesos2);
  if (digito2 !== digitos[13]) return false;

  return true;
}

function telefoneValido(telefone) {
  const num = telefone.replace(/\D/g, '');
  return num.length === 10 || num.length === 11;
}

function validarCampos(dados) {
  const { nome, cnpj, endereco, telefone, email, contato } = dados;
  const erros = {};
  if (!nome) erros.nome = 'Nome é obrigatório';
  if (!cnpj) erros.cnpj = 'CNPJ é obrigatório';
  else if (!cnpjValido(cnpj)) erros.cnpj = 'CNPJ inválido';
  if (!endereco) erros.endereco = 'Endereço é obrigatório';
  if (!telefone) erros.telefone = 'Telefone é obrigatório';
  else if (!telefoneValido(telefone)) erros.telefone = 'Telefone inválido. Use o formato (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX';
  if (!email) erros.email = 'E-mail é obrigatório';
  else if (!emailValido(email)) erros.email = 'E-mail inválido';
  if (!contato) erros.contato = 'Contato é obrigatório';
  return erros;
}

function listar(req, res) {
  const fornecedores = db.prepare('SELECT * FROM fornecedor ORDER BY nome').all();
  res.json(fornecedores);
}

function buscar(req, res) {
  const f = db.prepare('SELECT * FROM fornecedor WHERE id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  res.json(f);
}

function criar(req, res) {
  const erros = validarCampos(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  const { nome, endereco, telefone, email, contato } = req.body;
  const cnpj = (req.body.cnpj || '').replace(/\D/g, '');

  // verifica CNPJ duplicado
  const existente = db.prepare('SELECT id FROM fornecedor WHERE cnpj = ?').get(cnpj);
  if (existente) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  const result = db.prepare(`
    INSERT INTO fornecedor (nome, cnpj, endereco, telefone, email, contato)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome, cnpj, endereco, telefone, email, contato);

  res.status(201).json({
    id: result.lastInsertRowid,
    mensagem: 'Fornecedor cadastrado com sucesso!'
  });
}

function atualizar(req, res) {
  const { id } = req.params;
  const existente = db.prepare('SELECT * FROM fornecedor WHERE id = ?').get(id);
  if (!existente) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

  const erros = validarCampos(req.body);
  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erros });
  }

  const { nome, endereco, telefone, email, contato } = req.body;
  const cnpj = (req.body.cnpj || '').replace(/\D/g, '');

  // se mudou o CNPJ, verifica se outro registro já o usa
  const cnpjAntigo = (existente.cnpj || '').replace(/\D/g, '');
  if (cnpj !== cnpjAntigo) {
    const outro = db.prepare('SELECT id FROM fornecedor WHERE cnpj = ? AND id != ?').get(cnpj, id);
    if (outro) {
      return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
    }
  }

  db.prepare(`
    UPDATE fornecedor SET nome=?, cnpj=?, endereco=?, telefone=?, email=?, contato=?
    WHERE id=?
  `).run(nome, cnpj, endereco, telefone, email, contato, id);

  res.json({ mensagem: 'Fornecedor atualizado com sucesso!' });
}

function remover(req, res) {
  const result = db.prepare('DELETE FROM fornecedor WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  }
  res.json({ mensagem: 'Fornecedor removido com sucesso!' });
}

module.exports = { listar, buscar, criar, atualizar, remover };
