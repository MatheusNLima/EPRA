const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do diretório de upload para portfólio
const uploadDir = path.join(__dirname, '../../uploads/portfolio');
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
        cb(null, 'portfolio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens nos formatos PNG, JPG, JPEG e GIF são permitidas.'), false);
    }
};

// Configuração do Multer com limites
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por imagem
    }
});

// Middleware wrapper para interceptar e tratar erros do Multer
const uploadPortfolioMiddleware = (req, res, next) => {
    // Permite no máximo 5 imagens sob o campo 'imagens'
    upload.array('imagens', 5)(req, res, (err) => {
        if (err) {
            console.error('❌ ERRO NO UPLOAD DE PORTFÓLIO:', err);
            
            // Tratar erros específicos do Multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ erro: 'Número máximo de imagens permitido é 5.' });
                }
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ erro: 'O tamanho máximo permitido para cada imagem é 5MB.' });
                }
                return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
            }
            
            // Outros erros (ex: filtro de tipo de arquivo)
            return res.status(400).json({ erro: err.message });
        }
        next();
    });
};

module.exports = uploadPortfolioMiddleware;
