# Projeto Integrador: Full Stack

Sistema de Controle de Estoque desenvolvido como Projeto Integrador da disciplina de Full Stack — Faculdade Gran.

O sistema implementa as três features descritas na apostila:

- Cadastro de Fornecedor
- Cadastro de Produtos
- Associação de Fornecedor a Produto (relação muitos-para-muitos)

## Tecnologias

**Backend:** Node.js + Express + SQLite (better-sqlite3)
**Frontend:** React 18 + React Router

## Estrutura

```
projeto-integrador-fullstack/
├── backend/         API REST em Node.js
└── frontend/        Aplicação React
```

## Como executar

Pré-requisitos: Node.js LTS instalado (https://nodejs.org/).

### 1. Backend

Em um terminal:

```bash
cd backend
npm install
node app.js
```

O servidor sobe em `http://localhost:3000`. Na primeira execução o banco SQLite (`backend/estoque.db`) é criado automaticamente com as três tabelas (`fornecedor`, `produto`, `produto_fornecedor`).

### 2. Frontend

Em outro terminal (sem fechar o anterior):

```bash
cd frontend
npm install
npm start
```

Como o backend já ocupa a porta 3000, o React vai perguntar:

> Something is already running on port 3000. Would you like to run the app on another port instead? (Y/n)

Pressione **Y**. O frontend abrirá em `http://localhost:3001`.

## Endpoints da API

### Fornecedores
- `GET  /fornecedores` — lista todos
- `GET  /fornecedores/:id` — busca por ID
- `POST /fornecedores` — cria (valida CNPJ único e campos obrigatórios)
- `PUT  /fornecedores/:id` — atualiza
- `DELETE /fornecedores/:id` — remove
- `GET  /fornecedores/:id/produtos` — produtos associados ao fornecedor

### Produtos
- `GET  /produtos`
- `GET  /produtos/:id`
- `POST /produtos` — valida código de barras único
- `PUT  /produtos/:id`
- `DELETE /produtos/:id`

### Associação
- `GET  /produtos/:id/fornecedores` — fornecedores associados a um produto
- `POST /produtos/:id/fornecedores` — associar (body: `{ "fornecedor_id": 1 }`)
- `DELETE /produtos/:id/fornecedores/:fornecedorId` — desassociar

## Cenários atendidos

| Feature | Cenário | Atendido |
|---|---|---|
| Cadastro Fornecedor | Sucesso → mensagem "Fornecedor cadastrado com sucesso!" | ✓ |
| Cadastro Fornecedor | CNPJ duplicado → "Fornecedor com esse CNPJ já está cadastrado!" | ✓ |
| Cadastro Fornecedor | Campos inválidos → erros ao lado dos campos | ✓ |
| Cadastro Produto | Sucesso → "Produto cadastrado com sucesso!" | ✓ |
| Cadastro Produto | Código duplicado → "Produto com este código de barras já está cadastrado!" | ✓ |
| Cadastro Produto | Campos inválidos → erros ao lado dos campos | ✓ |
| Associação | Sucesso → "Fornecedor associado com sucesso ao produto!" | ✓ |
| Associação | Já associado → "Fornecedor já está associado a este produto!" | ✓ |
| Associação | Desassociar → "Fornecedor desassociado com sucesso!" | ✓ |


