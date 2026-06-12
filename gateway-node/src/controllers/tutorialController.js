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

// 1. Listar todos os tutoriais
const listarTutoriais = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM tutorial ORDER BY id DESC');
        
        // Formatar imagens_paths de string para array JSON
        const tutoriais = resultado.rows.map(row => {
            try {
                row.imagens_paths = row.imagens_paths ? JSON.parse(row.imagens_paths) : [];
            } catch (e) {
                row.imagens_paths = [];
            }
            return row;
        });

        res.json(tutoriais);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (LISTAR TUTORIAIS):', err);
        res.status(500).json({ erro: 'Erro ao buscar tutoriais na base de dados.' });
    }
};

// 2. Criar um novo tutorial
const criarTutorial = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { titulo, conteudo, linkgithub, tags, descricao, link_video } = req.body;

    // Validação de campos obrigatórios
    if (!titulo || !conteudo) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
    }

    // Normalização das tags (minúsculas, sem espaços extras)
    const tagsNormalizadas = tags 
        ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '').join(',')
        : null;

    // Processamento de imagens recebidas via multer
    const imagensPaths = req.files ? req.files.map(f => `/uploads/tutoriais/${f.filename}`) : [];

    try {
        const resultado = await db.query(
            'INSERT INTO tutorial (titulo, conteudo, linkgithub, tags, descricao, imagens_paths, link_video) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [titulo, conteudo, linkgithub, tagsNormalizadas, descricao, JSON.stringify(imagensPaths), link_video]
        );

        const tutorialCriado = resultado.rows[0];
        try {
            tutorialCriado.imagens_paths = JSON.parse(tutorialCriado.imagens_paths);
        } catch (e) {
            tutorialCriado.imagens_paths = [];
        }

        res.status(201).json({ mensagem: 'Tutorial criado com sucesso!', tutorial: tutorialCriado });
    } catch (err) {
        // Limpeza dos arquivos físicos caso a query sql falhe
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        console.error('❌ ERRO DETALHADO DO BANCO (CRIAR TUTORIAL):', err);
        res.status(500).json({ erro: 'Erro interno ao guardar o tutorial na base de dados.' });
    }
};

// 3. Atualizar um tutorial existente
const atualizarTutorial = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { id } = req.params;
    const { titulo, conteudo, linkgithub, tags, descricao, link_video, imagens_mantidas } = req.body;

    // Validação de campos obrigatórios
    if (!titulo || !conteudo) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
    }

    try {
        // Buscar o tutorial existente
        const tutorialExistente = await db.query('SELECT * FROM tutorial WHERE id = $1', [id]);
        if (tutorialExistente.rows.length === 0) {
            if (req.files) {
                for (const f of req.files) {
                    fs.unlink(f.path, () => {});
                }
            }
            return res.status(404).json({ erro: 'Tutorial não encontrado.' });
        }

        const oldTutorial = tutorialExistente.rows[0];
        let oldImagensPaths = [];
        try {
            oldImagensPaths = oldTutorial.imagens_paths ? JSON.parse(oldTutorial.imagens_paths) : [];
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
        const novasImagens = req.files ? req.files.map(f => `/uploads/tutoriais/${f.filename}`) : [];
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
            'UPDATE tutorial SET titulo = $1, conteudo = $2, linkgithub = $3, tags = $4, descricao = $5, imagens_paths = $6, link_video = $7 WHERE id = $8 RETURNING *',
            [titulo, conteudo, linkgithub, tagsNormalizadas, descricao, JSON.stringify(totalImagens), link_video, id]
        );

        const tutorialAtualizado = resultado.rows[0];
        try {
            tutorialAtualizado.imagens_paths = JSON.parse(tutorialAtualizado.imagens_paths);
        } catch (e) {
            tutorialAtualizado.imagens_paths = [];
        }

        res.json({ mensagem: 'Tutorial atualizado com sucesso!', tutorial: tutorialAtualizado });
    } catch (err) {
        if (req.files) {
            for (const f of req.files) {
                fs.unlink(f.path, () => {});
            }
        }
        console.error('❌ ERRO DETALHADO DO BANCO (ATUALIZAR TUTORIAL):', err);
        res.status(500).json({ erro: 'Erro ao atualizar o tutorial.' });
    }
};

// 4. Excluir um tutorial
const excluirTutorial = async (req, res) => {
    if (!verificarAcesso(req, res)) return;

    const { id } = req.params;
    try {
        const resultado = await db.query('DELETE FROM tutorial WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Tutorial não encontrado para exclusão.' });
        }

        const tutorialExcluido = resultado.rows[0];
        let imagens = [];
        try {
            imagens = tutorialExcluido.imagens_paths ? JSON.parse(tutorialExcluido.imagens_paths) : [];
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

        res.json({ mensagem: 'Tutorial excluído com sucesso!' });
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (EXCLUIR TUTORIAL):', err);
        res.status(500).json({ erro: 'Erro ao excluir o tutorial.' });
    }
};

// 5. Obter um tutorial específico pelo ID
const obterTutorial = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query('SELECT * FROM tutorial WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutorial não encontrado.' });
        }
        
        const tutorial = resultado.rows[0];
        try {
            tutorial.imagens_paths = tutorial.imagens_paths ? JSON.parse(tutorial.imagens_paths) : [];
        } catch (e) {
            tutorial.imagens_paths = [];
        }
        
        res.json(tutorial);
    } catch (err) {
        console.error('❌ ERRO DETALHADO DO BANCO (OBTER TUTORIAL):', err);
        res.status(500).json({ erro: 'Erro ao buscar tutorial na base de dados.' });
    }
};

module.exports = { listarTutoriais, criarTutorial, atualizarTutorial, excluirTutorial, obterTutorial };