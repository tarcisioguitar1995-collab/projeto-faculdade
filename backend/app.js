const express = require('express');
const cors = require('cors');

// inicializa o banco (cria tabelas se não existirem)
require('./database');

const fornecedoresRouter = require('./routes/fornecedores');
const produtosRouter = require('./routes/produtos');
const fichasTecnicasRouter = require('./routes/fichasTecnicas');
const producaoRouter = require('./routes/producao');

const app = express();

app.use(cors());
app.use(express.json());

// rotas
app.use('/fornecedores', fornecedoresRouter);
app.use('/produtos', produtosRouter);
app.use('/fichas-tecnicas', fichasTecnicasRouter);
app.use('/producao', producaoRouter);

// rota raiz - útil para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Projeto Integrador - Sistema de Controle de Estoque',
    endpoints: ['/fornecedores', '/produtos', '/produtos/:id/fornecedores', '/fichas-tecnicas/:produto_id', '/producao']
  });
});

// middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
