const express = require('express');
const router = express.Router();
const { 
    listarDesafios,
    obterDesafioPorId,
    criarDesafio,
    atualizarDesafio,
    deletarDesafio,
    submeterSolucao,
    contarSolucoes
} = require('../controllers/desafioController');

router.get('/', listarDesafios);
router.get('/:id', obterDesafioPorId);
router.post('/', criarDesafio);
router.put('/:id', atualizarDesafio);
router.delete('/:id', deletarDesafio);
router.post('/:desafio_id/solucoes', submeterSolucao);
router.get('/:desafio_id/solucoes', contarSolucoes);

module.exports = router;