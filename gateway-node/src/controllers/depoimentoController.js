const db = require('../config/db');

const listarDepoimentos = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM depoimento WHERE aprovado = true ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarDepoimentos };