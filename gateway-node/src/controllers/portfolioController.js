const db = require('../config/db');

const listarPortfolio = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM portfolio ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar projetos do portfólio.' });
    }
};

const criarPortfolio = async (req, res) => {
    const { titulo, autor, descricao, link_github } = req.body;
    try {
        const resultado = await db.query(
            'INSERT INTO portfolio (titulo, autor, descricao, link_github) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, autor, descricao, link_github]
        );
        res.status(201).json({ mensagem: 'Projeto adicionado com sucesso!', projeto: resultado.rows[0] });
    } catch (err) {
        console.error("Erro no BD ao criar portfolio:", err);
        res.status(500).json({ erro: 'Erro ao criar projeto.' });
    }
};

const atualizarPortfolio = async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, descricao, link_github } = req.body;
    try {
        const resultado = await db.query(
            'UPDATE portfolio SET titulo = $1, autor = $2, descricao = $3, link_github = $4 WHERE id = $5 RETURNING *',
            [titulo, autor, descricao, link_github, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Projeto não encontrado.' });
        res.json({ mensagem: 'Projeto atualizado com sucesso!', projeto: resultado.rows[0] });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar projeto.' });
    }
};

const deletarPortfolio = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM portfolio WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Projeto não encontrado.' });
        res.json({ mensagem: 'Projeto deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao deletar projeto.' });
    }
};

module.exports = { listarPortfolio, criarPortfolio, atualizarPortfolio, deletarPortfolio };