const db = require('../config/db');

// 1. Criar um novo curso
const criarCurso = async (req, res) => {
    const { titulo, descricao, datainicio, vagas } = req.body;
    try {
        const resultado = await db.query(
            'INSERT INTO curso (titulo, descricao, datainicio, vagas) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, descricao, datainicio, vagas]
        );
        res.status(201).json({ mensagem: 'Curso criado com sucesso!', curso: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (CRIAR CURSO):', err);
        res.status(500).json({ erro: 'Erro interno ao guardar o curso na base de dados.' });
    }
};

// 2. Listar todos os cursos
const listarCursos = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM curso ORDER BY datainicio ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (LISTAR CURSOS):', err);
        res.status(500).json({ erro: 'Erro ao procurar cursos na base de dados.' });
    }
};

// 3. Obter um curso específico pelo ID (para preencher o modal de edição)
const obterCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('SELECT * FROM curso WHERE id = $1', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Curso não encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error('❌ ERRO AO OBTER CURSO:', err);
        res.status(500).json({ erro: 'Erro ao buscar curso na base de dados.' });
    }
};

// 4. Atualizar os dados de um curso
const atualizarCurso = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, datainicio, vagas } = req.body;
    try {
        const resultado = await db.query(
            'UPDATE curso SET titulo = $1, descricao = $2, datainicio = $3, vagas = $4 WHERE id = $5 RETURNING *',
            [titulo, descricao, datainicio, vagas, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Curso não encontrado' });
        res.json({ mensagem: 'Curso atualizado com sucesso!', curso: resultado.rows[0] });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (ATUALIZAR CURSO):', err);
        res.status(500).json({ erro: 'Erro ao atualizar o curso.' });
    }
};

// 5. Excluir um curso
const excluirCurso = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM curso WHERE id = $1 RETURNING *', [id]);
        
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Curso não encontrado para exclusão' });
        }
        
        res.json({ mensagem: 'Curso excluído com sucesso!' });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (EXCLUIR CURSO):', err);
        res.status(500).json({ erro: 'Erro ao excluir o curso.' });
    }
};

module.exports = { criarCurso, listarCursos, obterCurso, atualizarCurso, excluirCurso };