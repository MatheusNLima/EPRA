const express = require('express');
const router = express.Router();
const { listarVagas } = require('../controllers/vagaController');

router.get('/', listarVagas);

module.exports = router;