const express = require('express');
const router = express.Router();
const { listarTutoriais } = require('../controllers/tutorialController');

router.get('/', listarTutoriais);

module.exports = router;