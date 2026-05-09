const express = require('express');
const router = express.Router();
const c = require('../controllers/fichaTecnicaController');

router.get('/:produto_id', c.listar);
router.post('/:produto_id', c.salvar);

module.exports = router;
