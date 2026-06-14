const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadSolucaoMiddleware = require('../middlewares/uploadSolucaoMiddleware');
const { 
    listarDesafios, 
    obterDesafio, 
    criarDesafio, 
    atualizarDesafio, 
    excluirDesafio,
    submeterSolucao,
    listarSolucoes,
    avaliarSolucao,
    downloadSolucao
} = require('../controllers/desafioController');

router.get('/', listarDesafios);
router.get('/:id', obterDesafio);
router.post('/', authMiddleware, criarDesafio);
router.put('/:id', authMiddleware, atualizarDesafio);
router.delete('/:id', authMiddleware, excluirDesafio);

// Solutions submission & query routes
router.post('/:id/solucoes', authMiddleware, uploadSolucaoMiddleware, submeterSolucao);
router.get('/:id/solucoes', authMiddleware, listarSolucoes);
router.put('/solucoes/:solucaoId', authMiddleware, avaliarSolucao);
router.get('/solucoes/download/:filename', authMiddleware, downloadSolucao);

module.exports = router;