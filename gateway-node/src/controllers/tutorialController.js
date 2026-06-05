const db = require('../config/db');

const listarTutoriais = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM tutorial ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarTutoriais };