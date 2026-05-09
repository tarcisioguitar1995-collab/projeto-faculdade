const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'estoque.db'));

db.pragma('foreign_keys = ON');

db.exec(
  'CREATE TABLE IF NOT EXISTS fornecedor (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  nome TEXT NOT NULL,' +
  '  cnpj TEXT NOT NULL UNIQUE,' +
  '  endereco TEXT NOT NULL,' +
  '  telefone TEXT NOT NULL,' +
  '  email TEXT NOT NULL,' +
  '  contato TEXT NOT NULL' +
  ');' +

  ' CREATE TABLE IF NOT EXISTS produto (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  nome TEXT NOT NULL,' +
  '  codigo_barras TEXT UNIQUE,' +
  '  descricao TEXT NOT NULL,' +
  '  quantidade INTEGER DEFAULT 0,' +
  '  estoque_minimo INTEGER DEFAULT 0,' +
  '  unidade_medida TEXT DEFAULT \'un\',' +
  '  categoria TEXT NOT NULL,' +
  '  data_validade TEXT,' +
  '  imagem TEXT' +
  ');' +

  ' CREATE TABLE IF NOT EXISTS produto_fornecedor (' +
  '  produto_id INTEGER NOT NULL,' +
  '  fornecedor_id INTEGER NOT NULL,' +
  '  PRIMARY KEY (produto_id, fornecedor_id),' +
  '  FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,' +
  '  FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE CASCADE' +
  ');' +

  ' CREATE TABLE IF NOT EXISTS ficha_tecnica (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  produto_id INTEGER NOT NULL,' +
  '  insumo_id INTEGER NOT NULL,' +
  '  quantidade_consumida REAL NOT NULL,' +
  '  FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,' +
  '  FOREIGN KEY (insumo_id) REFERENCES produto(id) ON DELETE CASCADE' +
  ');' +

  ' CREATE TABLE IF NOT EXISTS producao (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  produto_id INTEGER NOT NULL,' +
  '  quantidade_produzida INTEGER NOT NULL,' +
  '  data TEXT NOT NULL DEFAULT (datetime(\'now\', \'localtime\')),' +
  '  FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE' +
  ');'
);

// migração: adiciona colunas novas se não existirem (para bancos criados antes da expansão)
try {
  db.exec('ALTER TABLE produto ADD COLUMN estoque_minimo INTEGER DEFAULT 0');
} catch (e) {}
try {
  db.exec('ALTER TABLE produto ADD COLUMN unidade_medida TEXT DEFAULT \'un\'');
} catch (e) {}

module.exports = db;
