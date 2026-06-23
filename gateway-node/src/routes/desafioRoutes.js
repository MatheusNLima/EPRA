const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Proteção
const { 
    listarDesafios,
    obterDesafioPorId,
    criarDesafio,
    atualizarDesafio,
    deletarDesafio,
    listarSolucoes,
    avaliarSolucao
} = require('../controllers/desafioController');

// Rotas Públicas
router.get('/', listarDesafios);
router.get('/:id', obterDesafioPorId);

// Rotas Protegidas (Apenas Admin/Orientador)
router.post('/', authMiddleware, criarDesafio);
router.put('/:id', authMiddleware, atualizarDesafio);
router.delete('/:id', authMiddleware, deletarDesafio);

// Rotas para Gerir Soluções (Apenas Admin/Orientador)
router.get('/:desafio_id/solucoes', authMiddleware, listarSolucoes);
router.put('/solucoes/:solucao_id', authMiddleware, avaliarSolucao);

module.exports = router;