const express = require('express');
const router = express.Router();
const { obterCursos } = require('../controllers/cursoController');

router.get('/', obterCursos);

module.exports = router;