const express = require('express');
const router = express.Router();
const { obterTutoriais } = require('../controllers/tutorialController');
router.get('/', obterTutoriais);
module.exports = router;