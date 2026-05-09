const express = require('express');
const router = express.Router();
const c = require('../controllers/fornecedorController');
const a = require('../controllers/associacaoController');

router.get('/', c.listar);
router.get('/:id', c.buscar);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.remover);

// produtos de um fornecedor
router.get('/:id/produtos', a.produtosDoFornecedor);

module.exports = router;
