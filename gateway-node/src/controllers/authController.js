const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const resultado = await db.query('SELECT * FROM usuario WHERE email = $1', [email]);
        const usuario = resultado.rows[0];

        if (!usuario || usuario.senhahash !== senha) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo },
            'chave_secreta_epra_2026', // Em um cenário real, isso fica oculto em um arquivo .env
            { expiresIn: '8h' }
        );

        res.json({
            mensagem: 'Login aprovado',
            token,
            usuario: { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo }
        });

    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { login };