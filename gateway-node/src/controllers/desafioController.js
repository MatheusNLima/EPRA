const db = require('../config/db');

// 1. Listar todos os desafios (Público/Admin)
const listarDesafios = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM desafio ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar desafios:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// 2. Obter desafio por ID
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

// 3. Criar desafio (Admin)
const criarDesafio = async (req, res) => {
    try {
        // Agora alinhado com o admin.js e a tabela: titulo, descricao, datalimite
        const { titulo, descricao, datalimite } = req.body;
        const resultado = await db.query(
            'INSERT INTO desafio (titulo, descricao, datalimite) VALUES ($1, $2, $3) RETURNING *',
            [titulo, descricao, datalimite]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao criar desafio:', erro);
        res.status(500).json({ erro: 'Erro interno ao criar desafio' });
    }
};

// 4. Atualizar desafio (Admin)
const atualizarDesafio = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, datalimite } = req.body;
        const resultado = await db.query(
            'UPDATE desafio SET titulo = $1, descricao = $2, datalimite = $3 WHERE id = $4 RETURNING *',
            [titulo, descricao, datalimite, id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado para atualização' });
        }
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao atualizar desafio:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar' });
    }
};

// 5. Deletar desafio (Admin)
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
        res.status(500).json({ erro: 'Erro interno ao deletar' });
    }
};

// 6. Listar as soluções submetidas por alunos para o painel Admin
const listarSolucoes = async (req, res) => {
    try {
        const { desafio_id } = req.params;
        const resultado = await db.query('SELECT * FROM solucao_desafio WHERE desafio_id = $1 ORDER BY enviado_em DESC', [desafio_id]);
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar soluções:', erro);
        res.status(500).json({ erro: 'Erro ao buscar soluções' });
    }
};

// 7. O Coordenador/Orientador dar Nota e mudar o Status
const avaliarSolucao = async (req, res) => {
    try {
        const { solucao_id } = req.params;
        const { nota, status } = req.body;
        const resultado = await db.query(
            'UPDATE solucao_desafio SET nota = $1, status = $2 WHERE id = $3 RETURNING *',
            [nota, status, solucao_id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Solução não encontrada.' });
        }
        res.json({ mensagem: 'Avaliação guardada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao avaliar solução:', erro);
        res.status(500).json({ erro: 'Erro interno ao guardar a avaliação.' });
    }
};

module.exports = {
    listarDesafios,
    obterDesafioPorId,
    criarDesafio,
    atualizarDesafio,
    deletarDesafio,
    listarSolucoes,
    avaliarSolucao
};