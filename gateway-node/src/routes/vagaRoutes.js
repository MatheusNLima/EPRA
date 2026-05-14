const express = require('express');
const router = express.Router();
const { obterVagas } = require('../controllers/vagaController');

router.get('/', obterVagas);

module.exports = router;