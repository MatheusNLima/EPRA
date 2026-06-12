const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 1. Importamos o nosso segurança
const verificarToken = require('../middlewares/authMiddleware');

const { criarInscricao, criarInscricaoPublica, listarInscritosPorCurso, deletarInscricao, atualizarInscricao } = require('../controllers/inscricaoController');

// Configuração do Multer para guardar os PDFs na pasta 'uploads/'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Gera um nome único para o ficheiro (Ex: 1684323-12345.pdf)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ROTAS PRIVADAS (Painel Admin - Protegidas pelo verificarToken)
router.post('/', verificarToken, criarInscricao); // Inscrição manual do Admin
router.get('/curso/:curso_id', verificarToken, listarInscritosPorCurso); // Listar alunos é sigiloso!
router.delete('/:id', verificarToken, deletarInscricao); // Cancelar matrícula
router.put('/:id', verificarToken, atualizarInscricao); // Editar dados do aluno

// ROTA PÚBLICA (Site)
// Qualquer um pode enviar os dados, então NÃO leva o verificarToken
router.post('/publica', upload.single('termo_consentimento'), criarInscricaoPublica); 

module.exports = router;