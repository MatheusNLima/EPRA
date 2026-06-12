const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Importamos o nosso segurança
const verificarToken = require('../middlewares/authMiddleware');

// Verifica se todos estes estão aqui dentro das chaves {}
const { criarCurso, listarCursos, obterCurso, atualizarCurso, excluirCurso } = require('../controllers/cursoController');

// 2. Rotas PÚBLICAS (Visitantes do site precisam ver os cursos)
router.get('/', listarCursos);
router.get('/:id', obterCurso);

// 3. Rotas PRIVADAS (Apenas o Coordenador logado pode mexer)
router.post('/', verificarToken, criarCurso);
router.put('/:id', verificarToken, atualizarCurso);
router.delete('/:id', verificarToken, excluirCurso);
router.post('/', authMiddleware, criarCurso);
router.get('/:id', obterCurso);
router.put('/:id', authMiddleware, atualizarCurso);
router.delete('/:id', authMiddleware, excluirCurso);

module.exports = router;