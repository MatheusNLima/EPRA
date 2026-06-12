const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Verifica se todos estes estão aqui dentro das chaves {}
const { criarCurso, listarCursos, obterCurso, atualizarCurso, excluirCurso } = require('../controllers/cursoController');

router.get('/', listarCursos);
router.post('/', authMiddleware, criarCurso);
router.get('/:id', obterCurso);
router.put('/:id', authMiddleware, atualizarCurso);
router.delete('/:id', authMiddleware, excluirCurso);

module.exports = router;