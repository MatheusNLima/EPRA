const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Não autorizado. Token de autenticação ausente.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'chave_secreta_epra_2026');
        req.usuario = decoded;
        next();
    } catch (err) {
        console.error('❌ ERRO DETALHADO DE AUTENTICAÇÃO:', err);
        return res.status(401).json({ erro: 'Não autorizado. Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
