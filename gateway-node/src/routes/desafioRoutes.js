const express = require('express');
const router = express.Router();
const { listarDesafios } = require('../controllers/desafioController');

router.get('/', listarDesafios);

module.exports = router;