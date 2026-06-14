const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do diretório de upload para soluções
const uploadDir = path.join(__dirname, '../../uploads/solucoes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do armazenamento físico
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'solucao-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.rar'];
    const allowedExtensions = ['.zip', '.rar'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if ((allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream') && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos nos formatos ZIP e RAR são permitidos.'), false);
    }
};

// Configuração do Multer com limites
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB por arquivo
    }
});

// Middleware wrapper para interceptar e tratar erros do Multer
const uploadSolucaoMiddleware = (req, res, next) => {
    // Permite apenas um arquivo sob o campo 'arquivo'
    upload.single('arquivo')(req, res, (err) => {
        if (err) {
            console.error('❌ ERRO NO UPLOAD DE SOLUÇÃO:', err);
            
            // Tratar erros específicos do Multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ erro: 'O tamanho máximo permitido para o arquivo é 10MB.' });
                }
                return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
            }
            
            // Outros erros (ex: filtro de tipo de arquivo)
            return res.status(400).json({ erro: err.message });
        }
        next();
    });
};

module.exports = uploadSolucaoMiddleware;
