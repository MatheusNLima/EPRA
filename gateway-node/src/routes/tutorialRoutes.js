const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadTutorialMiddleware = require('../middlewares/uploadTutorialMiddleware');
const { listarTutoriais, criarTutorial, atualizarTutorial, excluirTutorial, obterTutorial } = require('../controllers/tutorialController');

router.get('/', listarTutoriais);
router.get('/:id', obterTutorial);
router.post('/', authMiddleware, uploadTutorialMiddleware, criarTutorial);
router.put('/:id', authMiddleware, uploadTutorialMiddleware, atualizarTutorial);
router.delete('/:id', authMiddleware, excluirTutorial);

module.exports = router;