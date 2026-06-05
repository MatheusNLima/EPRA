const express = require('express');
const router = express.Router();
const { listarDepoimentos } = require('../controllers/depoimentoController');

router.get('/', listarDepoimentos);

module.exports = router;