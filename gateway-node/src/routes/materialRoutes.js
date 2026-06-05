const express = require('express');
const router = express.Router();
const { listarMateriais } = require('../controllers/materialController');

router.get('/', listarMateriais);

module.exports = router;