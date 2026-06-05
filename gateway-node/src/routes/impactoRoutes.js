const express = require('express');
const router = express.Router();
const { listarMetricas } = require('../controllers/impactoController');

router.get('/', listarMetricas);

module.exports = router;