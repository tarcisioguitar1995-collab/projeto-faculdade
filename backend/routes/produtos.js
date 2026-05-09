const express = require('express');
const router = express.Router();
const c = require('../controllers/produtoController');
const a = require('../controllers/associacaoController');
const ft = require('../controllers/fichaTecnicaController');

router.get('/', c.listar);
router.get('/:id', c.buscar);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.remover);

// associação de fornecedores ao produto
router.get('/:id/fornecedores', a.fornecedoresDoProduto);
router.post('/:id/fornecedores', a.associar);
router.delete('/:id/fornecedores/:fornecedorId', a.desassociar);

// ficha técnica do produto
router.get('/:id/ficha-tecnica', ft.listar);
router.post('/:id/ficha-tecnica', ft.salvar);

module.exports = router;
