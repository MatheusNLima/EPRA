const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadPortfolioMiddleware = require('../middlewares/uploadPortfolioMiddleware');
const { 
    listarPortfolio, 
    obterPortfolio, 
    criarPortfolio, 
    atualizarPortfolio, 
    excluirPortfolio 
} = require('../controllers/portfolioController');

router.get('/', listarPortfolio);
router.get('/:id', obterPortfolio);
router.post('/', authMiddleware, uploadPortfolioMiddleware, criarPortfolio);
router.put('/:id', authMiddleware, uploadPortfolioMiddleware, atualizarPortfolio);
router.delete('/:id', authMiddleware, excluirPortfolio);

module.exports = router;