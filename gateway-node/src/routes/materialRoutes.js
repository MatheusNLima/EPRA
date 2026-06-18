const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

// O server.js já prefixa com '/api/materiais', então aqui usamos apenas '/'
router.get('/', materialController.listarMateriais);
router.post('/', materialController.criarMaterial);
router.put('/:id', materialController.atualizarMaterial);
router.delete('/:id', materialController.deletarMaterial);

module.exports = router;