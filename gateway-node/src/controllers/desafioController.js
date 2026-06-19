const db = require('../config/db');

// Listar todos os desafios (Público/Admin)
const listarDesafios = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM desafio ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar desafios:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Obter desafio por ID
const obterDesafioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM desafio WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado' });
        }
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao obter desafio:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Criar desafio (Admin)
const criarDesafio = async (req, res) => {
    try {
        const { titulo, descricao, dificuldade, recompensas } = req.body;
        const resultado = await db.query(
            'INSERT INTO desafio (titulo, descricao, dificuldade, recompensas) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, descricao, dificuldade, recompensas]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao criar desafio:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Atualizar desafio (Admin)
const atualizarDesafio = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, dificuldade, recompensas } = req.body;
        const resultado = await db.query(
            'UPDATE desafio SET titulo = $1, descricao = $2, dificuldade = $3, recompensas = $4 WHERE id = $5 RETURNING *',
            [titulo, descricao, dificuldade, recompensas, id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado para atualização' });
        }
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao atualizar desafio:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Deletar desafio (Admin)
const deletarDesafio = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('DELETE FROM desafio WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado para exclusão' });
        }
        res.json({ mensagem: 'Desafio excluído com sucesso' });
    } catch (erro) {
        console.error('Erro ao deletar desafio:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Submeter Solução de Desafio
const submeterSolucao = async (req, res) => {
    try {
        const { desafio_id } = req.params;
        const { link_repositorio } = req.body;
        const usuario_id = req.usuario ? req.usuario.id : 1; // Ajustar se autenticação estiver habilitada
        
        const resultado = await db.query(
            'INSERT INTO solucao_desafio (desafio_id, usuario_id, link_repositorio) VALUES ($1, $2, $3) RETURNING *',
            [desafio_id, usuario_id, link_repositorio]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao submeter solução:', erro);
        res.status(500).json({ erro: 'Erro ao submeter a solução' });
    }
};

// Contar solucoes de um desafio
const contarSolucoes = async (req, res) => {
    try {
        const { desafio_id } = req.params;
        const resultado = await db.query('SELECT COUNT(*) FROM solucao_desafio WHERE desafio_id = $1', [desafio_id]);
        res.json({ total: parseInt(resultado.rows[0].count, 10) });
    } catch (erro) {
        console.error('Erro ao contar solucoes:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = {
    contarSolucoes,
    listarDesafios,
    obterDesafioPorId,
    criarDesafio,
    atualizarDesafio,
    deletarDesafio,
    submeterSolucao
};