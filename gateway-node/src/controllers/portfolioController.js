const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Função utilitária para verificar permissão do tipo de usuário
const verificarAcesso = (req, res) => {
    const { tipo } = req.usuario;
    if (tipo !== 'ALUNO_INTERNO' && tipo !== 'ORIENTADOR') {
        res.status(403).json({ erro: 'Acesso negado. Apenas alunos internos e orientadores podem realizar esta ação.' });
        return false;
    }
    return true;
};

// 1. Listar todos os projetos do portfólio
const listarPortfolio = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM portfolio ORDER BY id DESC');
        
        // Formatar imagens_paths de string para array JSON
        const portfolio = resultado.rows.map(row => {
            try {
                row.imagens_paths = row.imagens_paths ? JSON.parse(row.imagens_paths) : [];
            } catch (e) {
                row.imagens_paths = [];
            }
            return row;
        });

        res.json(portfolio);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (LISTAR PORTFÓLIO):', err);
        res.status(500).json({ erro: 'Erro ao buscar portfólio na base de dados.' });
    }
};

// 2. Criar um novo projeto no portfólio
const criarPortfolio = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { titulo, autor, turma, descricao, conteudo, tags, link_github, link_video } = req.body;

    // Validação de campos obrigatórios
    if (!titulo || !autor || !turma || !descricao || !conteudo) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        return res.status(400).json({ erro: 'Título, autor, turma, descrição e conteúdo são obrigatórios.' });
    }

    // Normalização das tags (minúsculas, sem espaços extras)
    const tagsNormalizadas = tags 
        ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '').join(',')
        : null;

    // Processamento de imagens recebidas via multer
    const imagensPaths = req.files ? req.files.map(f => `/uploads/portfolio/${f.filename}`) : [];

    try {
        const resultado = await db.query(
            'INSERT INTO portfolio (titulo, autor, turma, descricao, conteudo, tags, link_github, link_video, imagens_paths) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [titulo, autor, turma, descricao, conteudo, tagsNormalizadas, link_github, link_video, JSON.stringify(imagensPaths)]
        );

        const projetoCriado = resultado.rows[0];
        try {
            projetoCriado.imagens_paths = JSON.parse(projetoCriado.imagens_paths);
        } catch (e) {
            projetoCriado.imagens_paths = [];
        }

        res.status(201).json({ mensagem: 'Projeto criado com sucesso!', projeto: projetoCriado });
    } catch (err) {
        // Limpeza dos arquivos físicos caso a query sql falhe
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        console.error('❌ ERRO DETALHADO DO BANCO (CRIAR PORTFÓLIO):', err);
        res.status(500).json({ erro: 'Erro interno ao guardar o projeto na base de dados.' });
    }
};

// 3. Atualizar um projeto existente no portfólio
const atualizarPortfolio = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { id } = req.params;
    const { titulo, autor, turma, descricao, conteudo, tags, link_github, link_video, imagens_mantidas } = req.body;

    // Validação de campos obrigatórios
    if (!titulo || !autor || !turma || !descricao || !conteudo) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        return res.status(400).json({ erro: 'Título, autor, turma, descrição e conteúdo são obrigatórios.' });
    }

    try {
        // Buscar o projeto existente
        const projetoExistente = await db.query('SELECT * FROM portfolio WHERE id = $1', [id]);
        if (projetoExistente.rows.length === 0) {
            if (req.files) {
                for (const f of req.files) {
                    fs.unlink(f.path, () => {});
                }
            }
            return res.status(404).json({ erro: 'Projeto não encontrado.' });
        }

        const oldProjeto = projetoExistente.rows[0];
        let oldImagensPaths = [];
        try {
            oldImagensPaths = oldProjeto.imagens_paths ? JSON.parse(oldProjeto.imagens_paths) : [];
        } catch (e) {
            oldImagensPaths = [];
        }

        // Determinar quais imagens antigas devem ser mantidas
        let mantidas = [];
        if (imagens_mantidas !== undefined) {
            try {
                mantidas = typeof imagens_mantidas === 'string' 
                    ? JSON.parse(imagens_mantidas) 
                    : imagens_mantidas;
                if (!Array.isArray(mantidas)) mantidas = [];
            } catch (e) {
                mantidas = [];
            }
        } else {
            // Se não fornecido, mantém todas as imagens antigas por padrão
            mantidas = oldImagensPaths;
        }

        // Caminhos das novas imagens enviadas nesta requisição
        const novasImagens = req.files ? req.files.map(f => `/uploads/portfolio/${f.filename}`) : [];
        const totalImagens = [...mantidas, ...novasImagens];

        // Validar limite de 5 imagens
        if (totalImagens.length > 5) {
            if (req.files) {
                for (const f of req.files) {
                    fs.unlink(f.path, () => {});
                }
            }
            return res.status(400).json({ erro: 'Número máximo de imagens permitido é 5.' });
        }

        // Deletar fisicamente do disco as imagens antigas que não foram mantidas
        const paraDeletar = oldImagensPaths.filter(p => !mantidas.includes(p));
        for (const imgPath of paraDeletar) {
            const fullPath = path.join(__dirname, '../..', imgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlink(fullPath, (err) => {
                    if (err) console.error(`❌ Erro ao apagar imagem antiga ${imgPath}:`, err);
                });
            }
        }

        // Normalização das tags
        const tagsNormalizadas = tags 
            ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '').join(',')
            : null;

        const resultado = await db.query(
            'UPDATE portfolio SET titulo = $1, autor = $2, turma = $3, descricao = $4, conteudo = $5, tags = $6, link_github = $7, link_video = $8, imagens_paths = $9 WHERE id = $10 RETURNING *',
            [titulo, autor, turma, descricao, conteudo, tagsNormalizadas, link_github, link_video, JSON.stringify(totalImagens), id]
        );

        const projetoAtualizado = resultado.rows[0];
        try {
            projetoAtualizado.imagens_paths = JSON.parse(projetoAtualizado.imagens_paths);
        } catch (e) {
            projetoAtualizado.imagens_paths = [];
        }

        res.json({ mensagem: 'Projeto atualizado com sucesso!', projeto: projetoAtualizado });
    } catch (err) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        console.error('❌ ERRO DETALHADO DO BANCO (ATUALIZAR PORTFÓLIO):', err);
        res.status(500).json({ erro: 'Erro ao atualizar o projeto.' });
    }
};

// 4. Excluir um projeto do portfólio
const excluirPortfolio = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM portfolio WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Projeto não encontrado para exclusão.' });
        }

        const projetoExcluido = resultado.rows[0];
        let imagens = [];
        try {
            imagens = projetoExcluido.imagens_paths ? JSON.parse(projetoExcluido.imagens_paths) : [];
        } catch (e) {
            imagens = [];
        }

        // Remover fisicamente todas as imagens associadas
        for (const imgPath of imagens) {
            const fullPath = path.join(__dirname, '../..', imgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlink(fullPath, (err) => {
                    if (err) console.error(`❌ Erro ao apagar imagem do disco:`, err);
                });
            }
        }

        res.json({ mensagem: 'Projeto excluído com sucesso!' });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (EXCLUIR PORTFÓLIO):', err);
        res.status(500).json({ erro: 'Erro ao excluir o projeto.' });
    }
};

// 5. Obter um projeto específico pelo ID
const obterPortfolio = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('SELECT * FROM portfolio WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Projeto não encontrado.' });
        }
        
        const projeto = resultado.rows[0];
        try {
            projeto.imagens_paths = projeto.imagens_paths ? JSON.parse(projeto.imagens_paths) : [];
        } catch (e) {
            projeto.imagens_paths = [];
        }
        
        res.json(projeto);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (OBTER PORTFÓLIO):', err);
        res.status(500).json({ erro: 'Erro ao buscar projeto na base de dados.' });
    }
};

module.exports = { listarPortfolio, criarPortfolio, atualizarPortfolio, excluirPortfolio, obterPortfolio };