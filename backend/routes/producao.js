const express = require('express');
const router = express.Router();
const c = require('../controllers/producaoController');

router.post('/', c.registrar);

module.exports = router;
