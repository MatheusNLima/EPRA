const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    listarVagas, 
    obterVaga, 
    criarVaga, 
    atualizarVaga, 
    excluirVaga,
    candidatarVaga,
    obterMinhasCandidaturas,
    listarCandidaturasPorVaga
} = require('../controllers/vagaController');

// Configuração do Multer para salvamento de PDF
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'curriculo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos.'), false);
        }
    }
});

// Wrapper para tratamento de erros do Multer
const uploadSingle = (req, res, next) => {
    upload.single('curriculo')(req, res, (err) => {
        if (err) {
            console.error('❌ ERRO MULTER:', err);
            return res.status(400).json({ erro: err.message });
        }
        next();
    });
};

router.get('/', listarVagas);
router.get('/minhas-candidaturas', authMiddleware, obterMinhasCandidaturas);
router.get('/:id', obterVaga);
router.post('/', authMiddleware, criarVaga);
router.put('/:id', authMiddleware, atualizarVaga);
router.delete('/:id', authMiddleware, excluirVaga);

// Candidatura a vaga específica
router.post('/:id/candidaturas', authMiddleware, uploadSingle, candidatarVaga);

// Rota do painel de administrador para listar os candidatos de uma vaga
router.get('/:id/candidaturas-admin', authMiddleware, listarCandidaturasPorVaga);

module.exports = router;