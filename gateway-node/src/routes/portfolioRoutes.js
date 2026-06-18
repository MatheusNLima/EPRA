const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// O server.js já prefixa com '/api/portfolio', então aqui usamos apenas '/'
router.get('/', portfolioController.listarPortfolio);
router.post('/', portfolioController.criarPortfolio);
router.put('/:id', portfolioController.atualizarPortfolio);
router.delete('/:id', portfolioController.deletarPortfolio);

module.exports = router;