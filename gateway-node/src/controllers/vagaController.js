const db = require('../config/db');

// 1. Listar todas as vagas
const listarVagas = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM vaga ORDER BY datalimite ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (LISTAR VAGAS):', err);
        res.status(500).json({ erro: 'Erro ao buscar vagas na base de dados.' });
    }
};

// 2. Obter uma vaga específica pelo ID (para preencher o modal de edição)
const obterVaga = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('SELECT * FROM vaga WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Vaga não encontrada.' });
        }
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (OBTER VAGA):', err);
        res.status(500).json({ erro: 'Erro ao buscar vaga na base de dados.' });
    }
};

// 3. Criar uma nova vaga
const criarVaga = async (req, res) => {
    const { titulo, descricao, datalimite } = req.body;
    try {
        const resultado = await db.query(
            'INSERT INTO vaga (titulo, descricao, datalimite) VALUES ($1, $2, $3) RETURNING *',
            [titulo, descricao, datalimite]
        );
        res.status(201).json({ mensagem: 'Vaga criada com sucesso!', vaga: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (CRIAR VAGA):', err);
        res.status(500).json({ erro: 'Erro interno ao guardar a vaga na base de dados.' });
    }
};

// 3. Atualizar uma vaga existente
const atualizarVaga = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, datalimite } = req.body;
    try {
        const resultado = await db.query(
            'UPDATE vaga SET titulo = $1, descricao = $2, datalimite = $3 WHERE id = $4 RETURNING *',
            [titulo, descricao, datalimite, id]
        );
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Vaga não encontrada.' });
        }
        res.json({ mensagem: 'Vaga atualizada com sucesso!', vaga: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (ATUALIZAR VAGA):', err);
        res.status(500).json({ erro: 'Erro ao atualizar a vaga.' });
    }
};

// 4. Excluir uma vaga
const excluirVaga = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM vaga WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Vaga não encontrada para exclusão.' });
        }
        res.json({ mensagem: 'Vaga excluída com sucesso!' });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (EXCLUIR VAGA):', err);
        res.status(500).json({ erro: 'Erro ao excluir a vaga.' });
    }
};

// 5. Candidatar-se a uma vaga
const candidatarVaga = async (req, res) => {
    const { id } = req.params; // ID da vaga
    const usuarioId = req.usuario.id;
    const { nome, email, curso, telefone, linkedin } = req.body;

    try {
        // 1. Verificar se a vaga existe
        const resultadoVaga = await db.query('SELECT * FROM vaga WHERE id = $1', [id]);
        if (resultadoVaga.rows.length === 0) {
            return res.status(404).json({ erro: 'Vaga não encontrada.' });
        }
        
        const vaga = resultadoVaga.rows[0];

        // 2. Verificar se o prazo limite já expirou (data limite comparada com a data atual)
        const hoje = new Date();
        const dataLimite = new Date(vaga.datalimite);
        // Zera as horas para comparar apenas as datas
        hoje.setHours(0, 0, 0, 0);
        dataLimite.setHours(0, 0, 0, 0);

        if (hoje > dataLimite) {
            return res.status(400).json({ erro: 'O prazo para inscrição nesta vaga já expirou.' });
        }

        // 3. Verificar candidatura única (RN-04)
        const candidaturaExistente = await db.query(
            'SELECT * FROM candidatura_vaga WHERE usuario_id = $1 AND vaga_id = $2',
            [usuarioId, id]
        );
        if (candidaturaExistente.rows.length > 0) {
            return res.status(400).json({ erro: 'Você já se candidatou a esta vaga.' });
        }

        // 4. Verificar se o arquivo do currículo foi enviado
        if (!req.file) {
            return res.status(400).json({ erro: 'Arquivo de currículo é obrigatório.' });
        }

        const curriculoPath = req.file.filename;

        // 5. Salvar candidatura no banco
        const insertQuery = `
            INSERT INTO candidatura_vaga 
            (usuario_id, vaga_id, nome, email, curso, telefone, linkedin, curriculo_path) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `;
        const params = [usuarioId, id, nome, email, curso, telefone, linkedin || null, curriculoPath];
        const resultadoCandidatura = await db.query(insertQuery, params);

        res.status(201).json({
            mensagem: 'Candidatura enviada com sucesso!',
            candidatura: resultadoCandidatura.rows[0]
        });

    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (CANDIDATAR VAGA):', err);
        res.status(500).json({ erro: 'Erro interno ao salvar candidatura.' });
    }
};

// 6. Obter vagas candidatadas pelo usuário atual
const obterMinhasCandidaturas = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const resultado = await db.query(
            'SELECT vaga_id FROM candidatura_vaga WHERE usuario_id = $1',
            [usuarioId]
        );
        // Retorna apenas a lista de IDs das vagas
        const idsVagas = resultado.rows.map(row => row.vaga_id);
        res.json(idsVagas);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (OBTER MINHAS CANDIDATURAS):', err);
        res.status(500).json({ erro: 'Erro ao buscar candidaturas do usuário.' });
    }
};

module.exports = { listarVagas, obterVaga, criarVaga, atualizarVaga, excluirVaga, candidatarVaga, obterMinhasCandidaturas };