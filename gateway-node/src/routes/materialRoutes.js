const express = require('express');
const router = express.Router();
const { obterMateriais } = require('../controllers/materialController');

router.get('/', obterMateriais);

module.exports = router;