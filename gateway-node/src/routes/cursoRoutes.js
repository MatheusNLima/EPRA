const express = require('express');
const router = express.Router();

// Verifica se todos estes estão aqui dentro das chaves {}
const { criarCurso, listarCursos, obterCurso, atualizarCurso, excluirCurso } = require('../controllers/cursoController');

router.get('/', listarCursos);
router.post('/', criarCurso);
router.get('/:id', obterCurso);
router.put('/:id', atualizarCurso);
router.delete('/:id', excluirCurso);

module.exports = router;