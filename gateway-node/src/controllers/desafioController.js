const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const verificarAcesso = (req, res) => {
    const { tipo } = req.usuario;
    if (tipo !== 'ALUNO_INTERNO' && tipo !== 'ORIENTADOR' && tipo !== 'COORDENADOR' && tipo !== 'ADMIN') {
        res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
        return false;
    }
    return true;
};

const listarDesafios = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM desafio ORDER BY datalimite ASC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const obterDesafio = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM desafio WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado' });
        }
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const criarDesafio = async (req, res) => {
    try {
        if (!verificarAcesso(req, res)) return;
        
        const { titulo, descricao, datalimite } = req.body;
        const resultado = await db.query(
            'INSERT INTO desafio (titulo, descricao, datalimite) VALUES ($1, $2, $3) RETURNING *',
            [titulo, descricao, datalimite]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const atualizarDesafio = async (req, res) => {
    try {
        if (!verificarAcesso(req, res)) return;

        const { id } = req.params;
        const { titulo, descricao, datalimite } = req.body;
        
        const resultado = await db.query(
            'UPDATE desafio SET titulo = $1, descricao = $2, datalimite = $3 WHERE id = $4 RETURNING *',
            [titulo, descricao, datalimite, id]
        );
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado' });
        }
        
        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const excluirDesafio = async (req, res) => {
    try {
        if (!verificarAcesso(req, res)) return;

        const { id } = req.params;
        const resultado = await db.query('DELETE FROM desafio WHERE id = $1 RETURNING *', [id]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Desafio não encontrado' });
        }
        
        res.json({ mensagem: 'Desafio excluído com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const submeterSolucao = async (req, res) => {
    try {
        const usuario = req.usuario;
        if (!usuario) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(401).json({ erro: 'Não autorizado' });
        }

        const { id: desafio_id } = req.params;
        const { nome, email, descricao, link_github } = req.body;
        const arquivo_path = req.file ? req.file.path : null;

        if (!link_github && !arquivo_path) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ erro: 'Forneça um link do GitHub ou anexe um arquivo.' });
        }

        // Check if challenge exists and deadline
        const desafioQuery = await db.query('SELECT datalimite FROM desafio WHERE id = $1', [desafio_id]);
        if (desafioQuery.rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ erro: 'Desafio não encontrado' });
        }

        // UTC-3 limit verification
        const dataLimite = new Date(desafioQuery.rows[0].datalimite);
        dataLimite.setUTCHours(23 + 3, 59, 59, 999); // Ajuste básico para UTC-3 final do dia
        if (new Date() > dataLimite) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ erro: 'O prazo para envio desta solução expirou.' });
        }

        // Check unique submission
        const subQuery = await db.query('SELECT 1 FROM solucao_desafio WHERE usuario_id = $1 AND desafio_id = $2', [usuario.id, desafio_id]);
        if (subQuery.rows.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ erro: 'Você já enviou uma solução para este desafio.' });
        }

        const resultado = await db.query(
            'INSERT INTO solucao_desafio (usuario_id, desafio_id, nome, email, descricao, link_github, arquivo_path) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [usuario.id, desafio_id, nome, email, descricao, link_github, arquivo_path]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao submeter solução:', erro);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const listarSolucoes = async (req, res) => {
    try {
        const { tipo } = req.usuario;
        if (tipo !== 'ALUNO_INTERNO' && tipo !== 'ORIENTADOR' && tipo !== 'COORDENADOR' && tipo !== 'ADMIN') {
            return res.status(403).json({ erro: 'Acesso negado' });
        }
        
        const { id: desafio_id } = req.params;
        const resultado = await db.query('SELECT * FROM solucao_desafio WHERE desafio_id = $1 ORDER BY enviado_em DESC', [desafio_id]);
        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const avaliarSolucao = async (req, res) => {
    try {
        const { tipo } = req.usuario;
        if (tipo !== 'ORIENTADOR' && tipo !== 'COORDENADOR' && tipo !== 'ADMIN') {
            return res.status(403).json({ erro: 'Acesso negado. Apenas orientadores podem avaliar.' });
        }

        const { solucaoId } = req.params;
        const { nota, status } = req.body;

        const resultado = await db.query(
            'UPDATE solucao_desafio SET nota = $1, status = $2 WHERE id = $3 RETURNING *',
            [nota, status, solucaoId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Solução não encontrada' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const downloadSolucao = async (req, res) => {
    try {
        const { tipo } = req.usuario;
        if (tipo !== 'ALUNO_INTERNO' && tipo !== 'ORIENTADOR' && tipo !== 'COORDENADOR' && tipo !== 'ADMIN') {
            return res.status(403).json({ erro: 'Acesso negado' });
        }

        const { filename } = req.params;
        if (filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ erro: 'Nome de arquivo inválido' });
        }

        const filePath = path.join(__dirname, '../../uploads/solucoes', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ erro: 'Arquivo não encontrado' });
        }

        res.download(filePath, filename);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { 
    listarDesafios, obterDesafio, criarDesafio, atualizarDesafio, excluirDesafio,
    submeterSolucao, listarSolucoes, avaliarSolucao, downloadSolucao
};