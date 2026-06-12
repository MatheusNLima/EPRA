const db = require('../config/db');
const fs = require('fs'); 
const path = require('path'); 

// 1. Criar Inscrição MANUAL (Usado pelo Painel Admin)
const criarInscricao = async (req, res) => {
    const { curso_id, nome, documento, email } = req.body;
    try {
        // 🔒 VALIDAÇÃO: Verifica se o Documento ou Email já existem neste curso
        const checkDuplicado = await db.query(
            'SELECT documento, email FROM inscricao WHERE curso_id = $1 AND (documento = $2 OR email = $3)',
            [curso_id, documento, email]
        );

        if (checkDuplicado.rowCount > 0) {
            const erroMsg = checkDuplicado.rows[0].documento === documento 
                ? 'Este documento já está inscrito neste curso.' 
                : 'Este e-mail já está cadastrado neste curso.';
            return res.status(400).json({ erro: erroMsg });
        }

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

// 1.5. Criar Inscrição PÚBLICA (Usado pelo Site)
const criarInscricaoPublica = async (req, res) => {
    const { curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino } = req.body;
    const termo_consentimento = req.file ? req.file.path : null;

    try {
        // 🔒 VALIDAÇÃO 1: Bloquear Documento ou E-mail duplicado no mesmo curso
        const checkDuplicado = await db.query(
            'SELECT documento, email FROM inscricao WHERE curso_id = $1 AND (documento = $2 OR email = $3)',
            [curso_id, documento, email]
        );

        if (checkDuplicado.rowCount > 0) {
            // Limpeza Profunda: apaga o PDF que tinha acabado de entrar no servidor
            if (termo_consentimento && fs.existsSync(termo_consentimento)) {
                fs.unlinkSync(termo_consentimento);
            }
            const erroMsg = checkDuplicado.rows[0].documento === documento 
                ? 'O documento informado já possui inscrição para esta turma.' 
                : 'Este e-mail já foi utilizado em uma inscrição para esta turma.';
            return res.status(400).json({ erro: erroMsg });
        }

        // 🔒 VALIDAÇÃO 2: Verifica as vagas matemáticas
        const checkVagas = await db.query(`
            SELECT c.vagas, COALESCE(i.qtd, 0) as inscritos
            FROM curso c
            LEFT JOIN (SELECT curso_id, COUNT(*) as qtd FROM inscricao GROUP BY curso_id) i ON c.id = i.curso_id
            WHERE c.id = $1
        `, [curso_id]);

        if (checkVagas.rowCount === 0) {
            if (termo_consentimento && fs.existsSync(termo_consentimento)) fs.unlinkSync(termo_consentimento);
            return res.status(404).json({ erro: 'Curso não encontrado.' });
        }
        
        if (checkVagas.rows[0].vagas - checkVagas.rows[0].inscritos <= 0) {
            if (termo_consentimento && fs.existsSync(termo_consentimento)) fs.unlinkSync(termo_consentimento);
            return res.status(400).json({ erro: 'Desculpe, as vagas para esta turma esgotaram!' });
        }

        // Tudo aprovado, faz o Insert final
        const resultado = await db.query(
            `INSERT INTO inscricao 
            (curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [curso_id, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento]
        );
        res.status(201).json({ mensagem: 'Inscrição pública recebida com sucesso!', inscricao: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO (INSCRIÇÃO PÚBLICA):', err);
        // Proteção extra contra lixo no disco: se a base de dados falhar (ex: fora do ar), apagamos o PDF.
        if (termo_consentimento && fs.existsSync(termo_consentimento)) fs.unlinkSync(termo_consentimento);
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

// 3. Deletar inscrição (Remover aluno e o seu PDF)
const deletarInscricao = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM inscricao WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Inscrição não encontrada.' });
        
        const inscricaoApagada = resultado.rows[0];

        if (inscricaoApagada.termo_consentimento) {
            const caminhoFicheiro = path.resolve(__dirname, '../../', inscricaoApagada.termo_consentimento);
            fs.unlink(caminhoFicheiro, (erroFS) => {
                if (!erroFS) console.log(`🗑️ Ficheiro físico removido: ${inscricaoApagada.termo_consentimento}`);
            });
        }

        res.json({ mensagem: 'Inscrição e documento removidos com sucesso!' });
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
        // Validação extra: Ao editar, garantir que não estamos usando o email/doc de OUTRO aluno no mesmo curso
        const verificado = await db.query('SELECT curso_id FROM inscricao WHERE id = $1', [id]);
        if(verificado.rowCount > 0) {
            const curso_id = verificado.rows[0].curso_id;
            const checkDuplicado = await db.query(
                'SELECT id FROM inscricao WHERE curso_id = $1 AND id != $2 AND (documento = $3 OR email = $4)',
                [curso_id, id, documento, email]
            );
            if(checkDuplicado.rowCount > 0) {
                return res.status(400).json({ erro: 'Este documento ou email já pertencem a outro aluno na mesma turma.' });
            }
        }

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