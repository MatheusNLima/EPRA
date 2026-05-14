const express = require('express');
const router = express.Router();
const { obterPortfolio } = require('../controllers/portfolioController');
router.get('/', obterPortfolio);
module.exports = router;