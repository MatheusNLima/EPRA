const db = require('../config/db');

const listarMetricas = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM metrica_impacto ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarMetricas };