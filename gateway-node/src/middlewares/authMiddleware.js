const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Procura o token no cabeçalho enviado pelo admin.js
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer token123..."

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // A MESMA chave secreta do seu authController.js!
        const secret = 'chave_secreta_epra_2026'; 
        
        // Se a chave não bater, o jwt.verify joga um erro e vai direto para o catch
        const decodificado = jwt.verify(token, secret);
        req.usuario = decodificado; // Guarda quem é o coordenador que fez a ação
        
        next(); // Tudo certo! Abre a porta para a rota continuar.
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};

module.exports = verificarToken;
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
