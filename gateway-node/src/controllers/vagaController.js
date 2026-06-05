const db = require('../config/db');

const listarVagas = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM vaga ORDER BY datalimite ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarVagas };