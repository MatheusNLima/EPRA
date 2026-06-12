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