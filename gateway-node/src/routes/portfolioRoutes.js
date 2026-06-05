const express = require('express');
const router = express.Router();
const { listarPortfolio } = require('../controllers/portfolioController');

router.get('/', listarPortfolio);

module.exports = router;