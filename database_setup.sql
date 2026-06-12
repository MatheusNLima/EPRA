-- Limpar tabelas existentes (Garante reset limpo)
DROP TABLE IF EXISTS solucao_desafio CASCADE;
DROP TABLE IF EXISTS candidatura_vaga CASCADE;
DROP TABLE IF EXISTS inscricao_curso CASCADE;
DROP TABLE IF EXISTS metrica_impacto CASCADE;
DROP TABLE IF EXISTS depoimento CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS desafio CASCADE;
DROP TABLE IF EXISTS tutorial CASCADE;
DROP TABLE IF EXISTS vaga CASCADE;
DROP TABLE IF EXISTS curso CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- 1. Tabela de Usuários
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senhahash VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL -- 'ORIENTADOR', 'ALUNO_INTERNO', 'ALUNO_EXTERNO'
);

-- 2. Tabela de Cursos
CREATE TABLE curso (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    datainicio TIMESTAMP NOT NULL,
    vagas INTEGER NOT NULL
);

-- 3. Tabela de Vagas
CREATE TABLE vaga (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    datalimite DATE NOT NULL
);

-- 4. Tabela de Tutoriais
CREATE TABLE tutorial (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,
    linkgithub VARCHAR(255),
    tags VARCHAR(255),
    descricao TEXT,
    imagens_paths TEXT,
    link_video VARCHAR(255)
);

-- 5. Tabela de Desafios
CREATE TABLE desafio (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    datalimite DATE NOT NULL
);

-- 6. Tabela de Portfolio
CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    link_github VARCHAR(255)
);

-- 7. Tabela de Depoimentos
CREATE TABLE depoimento (
    id SERIAL PRIMARY KEY,
    autor VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    aprovado BOOLEAN DEFAULT FALSE
);

-- 8. Tabela de Métricas de Impacto
CREATE TABLE metrica_impacto (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    valor VARCHAR(50) NOT NULL
);

-- 9. Tabela de Inscrição em Curso
CREATE TABLE inscricao_curso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    curso_id INTEGER REFERENCES curso(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Candidatura a Vaga
CREATE TABLE candidatura_vaga (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    vaga_id INTEGER REFERENCES vaga(id) ON DELETE CASCADE,
    nome VARCHAR(100),
    email VARCHAR(100),
    curso VARCHAR(100),
    telefone VARCHAR(50),
    linkedin VARCHAR(255),
    curriculo_path VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabela de Solução de Desafios
CREATE TABLE solucao_desafio (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    desafio_id INTEGER REFERENCES desafio(id) ON DELETE CASCADE,
    link_github VARCHAR(255) NOT NULL,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir Dados Iniciais (Seeding)

-- Usuário Orientador para login (Senha: admin123)
-- Importante: A verificação de login no authController.js compara usuario.senhahash !== senha
INSERT INTO usuario (nome, email, senhahash, tipo) 
VALUES ('Orientador EPRA', 'orientador@epra.com', 'admin123', 'ORIENTADOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuario (nome, email, senhahash, tipo) 
VALUES ('Matheus Lima', 'matheus@epra.com', 'aluno123', 'ALUNO_INTERNO')
ON CONFLICT (email) DO NOTHING;

-- Cursos Iniciais
INSERT INTO curso (titulo, descricao, datainicio, vagas) VALUES
('Introdução ao Arduino', 'Aprenda os conceitos básicos de eletrônica e programação com Arduino.', '2026-07-01 14:00:00', 20),
('Desenvolvimento Web Básico', 'Domine HTML, CSS e JavaScript Vanilla.', '2026-08-15 18:00:00', 15);

-- Vagas Iniciais
INSERT INTO vaga (titulo, descricao, datalimite) VALUES
('Bolsista de Robótica', 'Atuar no desenvolvimento de kits educativos de robótica.', '2026-06-30'),
('Desenvolvedor Node.js', 'Vaga de estágio para atuar no backend do portal EPRA.', '2026-07-10');

-- Tutoriais Iniciais
INSERT INTO tutorial (titulo, conteudo, linkgithub) VALUES
('Primeiros passos com LED e Arduino', 'Neste tutorial você aprenderá a fazer um LED piscar no Arduino.', 'https://github.com/epra/pisca-led'),
('Como configurar o Express.js', 'Tutorial básico de configuração do Express.', 'https://github.com/epra/setup-express');

-- Desafios Iniciais
INSERT INTO desafio (titulo, descricao, datalimite) VALUES
('Semáforo Inteligente', 'Crie um semáforo de trânsito usando Arduino e controle os tempos via código.', '2026-06-25'),
('Calculadora em Node.js', 'Desenvolva uma calculadora simples por linha de comando em Node.js.', '2026-07-05');

-- Portfolio Inicial
INSERT INTO portfolio (titulo, autor, link_github) VALUES
('Braço Robótico Controlado por Bluetooth', 'Equipe EPRA 2025', 'https://github.com/epra/braco-robotico'),
('Estufa Automatizada com IoT', 'João Silva', 'https://github.com/epra/estufa-iot');

-- Depoimentos
INSERT INTO depoimento (autor, texto, aprovado) VALUES
('Ana Clara', 'O EPRA mudou minha trajetória acadêmica e me deu base para conseguir meu primeiro estágio!', TRUE),
('Carlos Eduardo', 'Excelente projeto de extensão, os kits de robótica ajudaram muito no meu aprendizado.', TRUE);

-- Métricas de Impacto (Usando descricao conforme esperado no frontend)
INSERT INTO metrica_impacto (descricao, valor) VALUES
('Total de Inscritos', '150'),
('Certificados Emitidos', '45');
