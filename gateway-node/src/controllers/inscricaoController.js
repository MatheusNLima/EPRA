const db = require('../config/db');

// 1. Criar Inscrição MANUAL (Usado pelo Painel Admin - Coordenador entra sempre)
const criarInscricao = async (req, res) => {
    const { curso_id, nome, documento, email } = req.body;
    try {
        const resultado = await db.query(
            'INSERT INTO inscricao (curso_id, nome, documento, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [curso_id, nome, documento, email]
        );
        res.status(201).json({ mensagem: 'Inscrição manual realizada!', inscricao: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO (INSCRIÇÃO MANUAL):', err);
        res.status(500).json({ erro: 'Erro interno ao guardar a inscrição.' });
    }
};

// 1.5. Criar Inscrição PÚBLICA (Usado pelo Site - Verifica se há vagas matemáticas)
const criarInscricaoPublica = async (req, res) => {
    const { curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino } = req.body;
    const termo_consentimento = req.file ? req.file.path : null;

    try {
        // Verifica as vagas matematicamente antes de inserir
        const check = await db.query(`
            SELECT c.vagas, COALESCE(i.qtd, 0) as inscritos
            FROM curso c
            LEFT JOIN (SELECT curso_id, COUNT(*) as qtd FROM inscricao GROUP BY curso_id) i ON c.id = i.curso_id
            WHERE c.id = $1
        `, [curso_id]);

        if (check.rowCount === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
        
        // Se a matemática disser que Vagas Totais - Alunos Inscritos for menor ou igual a 0, bloqueia!
        if (check.rows[0].vagas - check.rows[0].inscritos <= 0) {
            return res.status(400).json({ erro: 'Desculpe, as vagas para esta turma esgotaram!' });
        }

        const resultado = await db.query(
            `INSERT INTO inscricao 
            (curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento]
        );
        res.status(201).json({ mensagem: 'Inscrição pública recebida com sucesso!', inscricao: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO (INSCRIÇÃO PÚBLICA):', err);
        res.status(500).json({ erro: 'Erro ao processar o formulário público.' });
    }
};

// 2. Listar inscritos de um curso específico (Painel Admin)
const listarInscritosPorCurso = async (req, res) => {
    const { curso_id } = req.params;
    try {
        const resultado = await db.query('SELECT * FROM inscricao WHERE curso_id = $1 ORDER BY id DESC', [curso_id]);
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ ERRO AO LISTAR INSCRITOS:', err);
        res.status(500).json({ erro: 'Erro ao procurar inscrições.' });
    }
};

// 3. Deletar inscrição (Remover aluno da vaga)
const deletarInscricao = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM inscricao WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Inscrição não encontrada.' });
        res.json({ mensagem: 'Inscrição removida com sucesso!' });
    } catch (err) {
        console.error('❌ ERRO AO DELETAR INSCRIÇÃO:', err);
        res.status(500).json({ erro: 'Erro ao processar remoção.' });
    }
};

// 4. Atualizar os dados de um aluno inscrito
const atualizarInscricao = async (req, res) => {
    const { id } = req.params;
    const { nome, documento, email } = req.body;
    try {
        const resultado = await db.query(
            'UPDATE inscricao SET nome = $1, documento = $2, email = $3 WHERE id = $4 RETURNING *',
            [nome, documento, email, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Inscrição não encontrada' });
        res.json({ mensagem: 'Inscrição atualizada com sucesso!', inscricao: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO AO ATUALIZAR INSCRIÇÃO:', err);
        res.status(500).json({ erro: 'Erro ao atualizar a inscrição.' });
    }
};

module.exports = { criarInscricao, criarInscricaoPublica, listarInscritosPorCurso, deletarInscricao, atualizarInscricao };