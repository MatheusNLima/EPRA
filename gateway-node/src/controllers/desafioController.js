const db = require('../config/db');

const listarDesafios = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM desafio ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarDesafios };