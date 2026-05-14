const express = require('express');
const router = express.Router();
const { obterImpacto } = require('../controllers/impactoController');
router.get('/', obterImpacto);
module.exports = router;