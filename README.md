# Projeto Integrador: Full Stack — MM Churros

Sistema de Controle de Estoque e Gestão de Produção desenvolvido como Projeto Integrador da disciplina de Full Stack — Faculdade Gran.

O sistema implementa as features descritas na apostila, expandidas para atender à empresa **MM Churros**:

- Cadastro de Fornecedor
- Cadastro de Produtos (insumos com unidade de medida e estoque mínimo)
- Associação de Fornecedor a Produto (relação muitos-para-muitos)
- **Ficha Técnica**: composição de produtos finais (churros) com seus insumos
- **Registro de Produção**: baixa automática de estoque com validação de insumos
- **Alerta de Estoque Crítico**: destaque visual para itens abaixo do estoque mínimo

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

O servidor sobe em `http://localhost:3000`. Na primeira execução o banco SQLite (`backend/estoque.db`) é criado automaticamente com as tabelas (`fornecedor`, `produto`, `produto_fornecedor`, `ficha_tecnica`, `producao`).

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
- `POST /produtos` — aceita `estoque_minimo` e `unidade_medida` (g, ml, un)
- `PUT  /produtos/:id`
- `DELETE /produtos/:id`

### Associação
- `GET  /produtos/:id/fornecedores` — fornecedores associados a um produto
- `POST /produtos/:id/fornecedores` — associar (body: `{ "fornecedor_id": 1 }`)
- `DELETE /produtos/:id/fornecedores/:fornecedorId` — desassociar

### Ficha Técnica
- `GET  /produtos/:id/ficha-tecnica` — lista a composição do produto (insumos e quantidades)
- `POST /produtos/:id/ficha-tecnica` — salva a composição (body: `{ "itens": [{ "insumo_id": 1, "quantidade_consumida": 0.5 }] }`)
- `GET  /fichas-tecnicas/:produto_id` — mesmo que acima (rota alternativa)
- `POST /fichas-tecnicas/:produto_id` — mesmo que acima (rota alternativa)

### Produção
- `POST /producao` — registra produção (body: `{ "produto_id": 1, "quantidade_produzida": 10 }`)
  - Verifica se há estoque de todos os insumos da ficha técnica
  - Subtrai automaticamente do estoque de cada insumo
  - Retorna erro 400 com detalhes se algum insumo for insuficiente
  - Retorna alertas se algum insumo atingir o nível crítico (estoque mínimo)

## Cenários atendidos

### Funcionalidades originais

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

### Novas funcionalidades (MM Churros)

| Feature | Cenário | Atendido |
|---|---|---|
| Ficha Técnica | Sucesso → "Ficha técnica salva com sucesso!" | ✓ |
| Ficha Técnica | Produto sem insumos → "Adicione pelo menos um insumo" | ✓ |
| Ficha Técnica | Insumo inexistente → "Insumo ID X não encontrado" | ✓ |
| Produção | Sucesso → "Produção registrada com sucesso!" + baixa no estoque | ✓ |
| Produção | Estoque insuficiente → "Estoque insuficiente para produção" com detalhes | ✓ |
| Produção | Estoque crítico → Alerta informando quais insumos atingiram o mínimo | ✓ |
| Produção | Sem ficha técnica → "Produto não possui ficha técnica cadastrada" | ✓ |
| Estoque Mínimo | Produto abaixo do mínimo → Linha destacada em vermelho na listagem | ✓ |

## Histórias de Usuário

### História 1: Cadastrar Ficha Técnica

> **Como** operador de produção da MM Churros,
> **Quero** cadastrar a composição de cada churro (quais insumos e suas quantidades),
> **Para** que o sistema possa calcular e dar baixa no estoque automaticamente durante a produção.

**Cenário 1: Cadastro bem-sucedido**
- **Dado que** existem insumos cadastrados (ex: massa, doce de leite, óleo)
- **E** um produto final cadastrado (ex: Churro de Doce de Leite)
- **Quando** o operador seleciona o produto, adiciona os insumos com suas quantidades e salva
- **Então** o sistema exibe "Ficha técnica salva com sucesso!"
- **E** a composição fica disponível para consulta

**Cenário 2: Tentativa sem insumos**
- **Dado que** o operador está cadastrando uma ficha técnica
- **Quando** tenta salvar sem adicionar nenhum insumo
- **Então** o sistema exibe "Adicione pelo menos um insumo com quantidade válida"

### História 2: Registrar Produção

> **Como** operador de produção da MM Churros,
> **Quero** registrar a quantidade de churros produzidos,
> **Para** que o sistema dê baixa automática no estoque dos insumos consumidos.

**Cenário 1: Produção bem-sucedida**
- **Dado que** o churro possui ficha técnica cadastrada
- **E** há estoque suficiente de todos os insumos
- **Quando** o operador informa a quantidade produzida e confirma
- **Então** o sistema registra a produção
- **E** subtrai a quantidade consumida de cada insumo
- **E** exibe "Produção registrada com sucesso!"

**Cenário 2: Estoque insuficiente**
- **Dado que** o churro possui ficha técnica cadastrada
- **E** pelo menos um insumo não tem estoque suficiente
- **Quando** o operador tenta registrar a produção
- **Então** o sistema exibe "Estoque insuficiente"
- **E** detalha qual(is) insumo(s) faltam e as quantidades necessárias vs. disponíveis

**Cenário 3: Estoque crítico após produção**
- **Dado que** a produção foi registrada com sucesso
- **E** após a baixa, algum insumo atingiu ou ficou abaixo do estoque mínimo
- **Quando** a produção é confirmada
- **Então** o sistema exibe um alerta informando quais insumos estão em nível crítico

### História 3: Visualizar Estoque Crítico

> **Como** gerente da MM Churros,
> **Quero** identificar rapidamente os insumos com estoque abaixo do mínimo,
> **Para** que possa programar compras antes que falte material.

**Cenário: Destaque visual**
- **Dado que** existem produtos cadastrados com `estoque_minimo` definido
- **Quando** a lista de produtos é exibida
- **Então** os itens com `quantidade <= estoque_minimo` aparecem destacados em vermelho
