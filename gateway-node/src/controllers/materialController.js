const db = require('../config/db');

const listarMateriais = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM materiais ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar materiais.' });
    }
};

const criarMaterial = async (req, res) => {
    const { titulo, tipo, categoria, link } = req.body;
    try {
        const resultado = await db.query(
            'INSERT INTO materiais (titulo, tipo, categoria, link) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, tipo, categoria, link]
        );
        res.status(201).json({ mensagem: 'Material adicionado com sucesso!', material: resultado.rows[0] });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar material.' });
    }
};

const atualizarMaterial = async (req, res) => {
    const { id } = req.params;
    const { titulo, tipo, categoria, link } = req.body;
    try {
        const resultado = await db.query(
            'UPDATE materiais SET titulo = $1, tipo = $2, categoria = $3, link = $4 WHERE id = $5 RETURNING *',
            [titulo, tipo, categoria, link, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Material não encontrado.' });
        res.json({ mensagem: 'Material atualizado com sucesso!', material: resultado.rows[0] });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar material.' });
    }
};

const deletarMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM materiais WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Material não encontrado.' });
        res.json({ mensagem: 'Material deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar material.' });
    }
};

module.exports = { listarMateriais, criarMaterial, atualizarMaterial, deletarMaterial };