--
-- PostgreSQL database dump
--

\restrict HpwiTYcgh2F6BoEGPnlhehPCUPrCeX8FaiznVq2v9CfrhCbmhRvwhl7BFPrVFKI

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-23 08:19:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: candidatura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidatura (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    vaga_id integer NOT NULL,
    datacandidatura timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.candidatura OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16407)
-- Name: candidatura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidatura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidatura_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidatura_id_seq OWNED BY public.candidatura.id;


--
-- TOC entry 245 (class 1259 OID 16585)
-- Name: candidatura_vaga; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidatura_vaga (
    id integer CONSTRAINT candidatura_vaga_id_not_null1 NOT NULL,
    usuario_id integer,
    vaga_id integer NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    curso character varying(255) NOT NULL,
    telefone character varying(50) NOT NULL,
    linkedin text,
    curriculo_path text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.candidatura_vaga OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16584)
-- Name: candidatura_vaga_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidatura_vaga_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidatura_vaga_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 244
-- Name: candidatura_vaga_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidatura_vaga_id_seq OWNED BY public.candidatura_vaga.id;


--
-- TOC entry 222 (class 1259 OID 16408)
-- Name: curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text,
    datainicio timestamp without time zone,
    vagas integer
);


ALTER TABLE public.curso OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16415)
-- Name: curso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curso_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 223
-- Name: curso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_id_seq OWNED BY public.curso.id;


--
-- TOC entry 224 (class 1259 OID 16416)
-- Name: depoimento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depoimento (
    id integer NOT NULL,
    nomeautor character varying(255) NOT NULL,
    texto text,
    fotourl character varying(255),
    aprovado boolean DEFAULT false
);


ALTER TABLE public.depoimento OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16424)
-- Name: depoimento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depoimento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depoimento_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 225
-- Name: depoimento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depoimento_id_seq OWNED BY public.depoimento.id;


--
-- TOC entry 226 (class 1259 OID 16425)
-- Name: desafio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.desafio (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text,
    datalimite date -- 🌟 COLUNA CORRIGIDA AQUI
);


ALTER TABLE public.desafio OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16432)
-- Name: desafio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.desafio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.desafio_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 227
-- Name: desafio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.desafio_id_seq OWNED BY public.desafio.id;


--
-- TOC entry 228 (class 1259 OID 16433)
-- Name: inscricao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscricao (
    id integer NOT NULL,
    curso_id integer NOT NULL,
    datainscricao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nome character varying(255),
    documento character varying(20),
    email character varying(255),
    telefone character varying(20),
    conhecimento_programacao character varying(3),
    conhecimento_robotica character varying(3),
    instituicao_ensino character varying(255),
    termo_consentimento character varying(255)
);


ALTER TABLE public.inscricao OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16440)
-- Name: inscricao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inscricao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscricao_id_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 229
-- Name: inscricao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inscricao_id_seq OWNED BY public.inscricao.id;


--
-- TOC entry 241 (class 1259 OID 16554)
-- Name: materiais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiais (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    categoria character varying(100) NOT NULL,
    tipo character varying(100) NOT NULL,
    link text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.materiais OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16553)
-- Name: materiais_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materiais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materiais_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 240
-- Name: materiais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materiais_id_seq OWNED BY public.materiais.id;


--
-- TOC entry 230 (class 1259 OID 16441)
-- Name: metrica_impacto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metrica_impacto (
    id integer NOT NULL,
    descricao character varying(255) NOT NULL,
    valor integer
);


ALTER TABLE public.metrica_impacto OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16446)
-- Name: metrica_impacto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metrica_impacto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metrica_impacto_id_seq OWNER TO postgres;

--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 231
-- Name: metrica_impacto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metrica_impacto_id_seq OWNED BY public.metrica_impacto.id;


--
-- TOC entry 243 (class 1259 OID 16569)
-- Name: portfolio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    autor character varying(255) NOT NULL,
    descricao text NOT NULL,
    link_github text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.portfolio OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16568)
-- Name: portfolio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_id_seq OWNER TO postgres;

--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 242
-- Name: portfolio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_id_seq OWNED BY public.portfolio.id;


--
-- TOC entry 247 (class 1259 OID 16607)
-- Name: solucao_desafio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solucao_desafio (
    id integer NOT NULL,
    desafio_id integer,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    link_github character varying(255),
    arquivo_path character varying(255),
    status character varying(50) DEFAULT 'Em Avaliação'::character varying,
    nota numeric(3,1),
    enviado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.solucao_desafio OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16606)
-- Name: solucao_desafio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solucao_desafio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solucao_desafio_id_seq OWNER TO postgres;

--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 246
-- Name: solucao_desafio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solucao_desafio_id_seq OWNED BY public.solucao_desafio.id;


--
-- TOC entry 232 (class 1259 OID 16447)
-- Name: submissao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissao (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    desafio_id integer NOT NULL,
    linkgithub character varying(255),
    dataenvio timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.submissao OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16454)
-- Name: submissao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissao_id_seq OWNER TO postgres;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 233
-- Name: submissao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissao_id_seq OWNED BY public.submissao.id;


--
-- TOC entry 234 (class 1259 OID 16455)
-- Name: tutorial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutorial (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    conteudo text,
    linkgithub character varying(255),
    descricao text, -- 🌟 COLUNA CORRIGIDA AQUI
    tags character varying(255), -- 🌟 COLUNA CORRIGIDA AQUI
    imagens_paths text, -- 🌟 COLUNA CORRIGIDA AQUI
    link_video character varying(255) -- 🌟 COLUNA CORRIGIDA AQUI
);


ALTER TABLE public.tutorial OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16462)
-- Name: tutorial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tutorial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tutorial_id_seq OWNER TO postgres;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 235
-- Name: tutorial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tutorial_id_seq OWNED BY public.tutorial.id;


--
-- TOC entry 236 (class 1259 OID 16463)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    senhahash character varying(255) NOT NULL,
    curso character varying(100),
    tipo character varying(50),
    ativo boolean DEFAULT true,
    CONSTRAINT usuario_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('ORIENTADOR'::character varying)::text, ('ALUNO_INTERNO'::character varying)::text, ('ALUNO_EXTERNO'::character varying)::text])))
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16474)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 237
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 238 (class 1259 OID 16475)
-- Name: vaga; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vaga (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text,
    datalimite timestamp without time zone
);


ALTER TABLE public.vaga OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16482)
-- Name: vaga_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vaga_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vaga_id_seq OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 239
-- Name: vaga_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vaga_id_seq OWNED BY public.vaga.id;


--
-- TOC entry 4932 (class 2604 OID 16483)
-- Name: candidatura id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura ALTER COLUMN id SET DEFAULT nextval('public.candidatura_id_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 16588)
-- Name: candidatura_vaga id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura_vaga ALTER COLUMN id SET DEFAULT nextval('public.candidatura_vaga_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 16484)
-- Name: curso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso ALTER COLUMN id SET DEFAULT nextval('public.curso_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 16485)
-- Name: depoimento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depoimento ALTER COLUMN id SET DEFAULT nextval('public.depoimento_id_seq'::regclass);


--
-- TOC entry 4937 (class 2604 OID 16486)
-- Name: desafio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafio ALTER COLUMN id SET DEFAULT nextval('public.desafio_id_seq'::regclass);


--
-- TOC entry 4938 (class 2604 OID 16487)
-- Name: inscricao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricao ALTER COLUMN id SET DEFAULT nextval('public.inscricao_id_seq'::regclass);


--
-- TOC entry 4947 (class 2604 OID 16557)
-- Name: materiais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais ALTER COLUMN id SET DEFAULT nextval('public.materiais_id_seq'::regclass);


--
-- TOC entry 4940 (class 2604 OID 16488)
-- Name: metrica_impacto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrica_impacto ALTER COLUMN id SET DEFAULT nextval('public.metrica_impacto_id_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 16572)
-- Name: portfolio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio ALTER COLUMN id SET DEFAULT nextval('public.portfolio_id_seq'::regclass);


--
-- TOC entry 4953 (class 2604 OID 16610)
-- Name: solucao_desafio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solucao_desafio ALTER COLUMN id SET DEFAULT nextval('public.solucao_desafio_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 16489)
-- Name: submissao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissao ALTER COLUMN id SET DEFAULT nextval('public.submissao_id_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 16490)
-- Name: tutorial id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutorial ALTER COLUMN id SET DEFAULT nextval('public.tutorial_id_seq'::regclass);


--
-- TOC entry 4944 (class 2604 OID 16491)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 4946 (class 2604 OID 16492)
-- Name: vaga id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaga ALTER COLUMN id SET DEFAULT nextval('public.vaga_id_seq'::regclass);


--
-- TOC entry 5142 (class 0 OID 16400)
-- Dependencies: 220
-- Data for Name: candidatura; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidatura (id, usuario_id, vaga_id, datacandidatura) VALUES (1, 2, 1, '2026-06-04 21:07:51.444244');
INSERT INTO public.candidatura (id, usuario_id, vaga_id, datacandidatura) VALUES (2, 7, 3, '2026-06-04 21:07:51.444244');


--
-- TOC entry 5167 (class 0 OID 16585)
-- Dependencies: 245
-- Data for Name: candidatura_vaga; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidatura_vaga (id, usuario_id, vaga_id, nome, email, curso, telefone, linkedin, curriculo_path, criado_em) VALUES (1, 1, 2, 'teste', 'mathnlzz@gmail.com', 'teste', '(88) 99604-4096', NULL, 'curriculo-1781880838389-738571158.pdf', '2026-06-19 11:53:58.438515');


--
-- TOC entry 5144 (class 0 OID 16408)
-- Dependencies: 222
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (2, 'Desenvolvimento de APIs', 'Construindo backends robustos com Node e Postgres.', '2026-03-05 19:00:00', 30);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (3, 'UX/UI Design', 'Criação de interfaces centradas no usuário.', '2026-04-01 14:00:00', 25);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (4, 'Automação de Testes (QA) com Pytest', 'Aprenda a testar APIs no GitHub.', '2026-08-10 19:00:00', 40);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (5, 'Infraestrutura e Redes', 'Otimização de rotas e algoritmos.', '2026-09-01 14:00:00', 20);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (6, 'Desenvolvimento C/C++', 'Fundamentos de alocação de memória.', '2026-10-15 08:00:00', 60);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (1, 'Lógica de Programação', 'Fundamentos para Praticantes em TI.', '2026-02-10 00:00:00', 50);
INSERT INTO public.curso (id, titulo, descricao, datainicio, vagas) VALUES (26, 'curso teste 1906', 'trataeadsada', '0131-03-12 00:00:00', 20);


--
-- TOC entry 5146 (class 0 OID 16416)
-- Dependencies: 224
-- Data for Name: depoimento; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.depoimento (id, nomeautor, texto, fotourl, aprovado) VALUES (17, 'Gabriel Toledo', 'Os desafios da plataforma ajudaram muito!', NULL, true);
INSERT INTO public.depoimento (id, nomeautor, texto, fotourl, aprovado) VALUES (18, 'Ranya Silva', 'Consegui minha primeira entrevista graças aos cursos.', NULL, true);


--
-- TOC entry 5148 (class 0 OID 16425)
-- Dependencies: 226
-- Data for Name: desafio; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.desafio (id, titulo, descricao) VALUES (1, 'Desafio Frontend', 'Criar uma landing page responsiva usando HTML e CSS puro.');
INSERT INTO public.desafio (id, titulo, descricao) VALUES (2, 'Desafio Backend', 'Implementar um sistema de autenticação JWT.');
INSERT INTO public.desafio (id, titulo, descricao) VALUES (3, 'Desafio Algoritmos', 'Resolver o problema de forma otimizada.');
INSERT INTO public.desafio (id, titulo, descricao) VALUES (4, 'Desafio QA', 'Configurar um ambiente de testes completo usando Pytest.');
INSERT INTO public.desafio (id, titulo, descricao) VALUES (5, 'Desafio de Modelagem', 'Criar o diagrama de classes UML.');


--
-- TOC entry 5150 (class 0 OID 16433)
-- Dependencies: 228
-- Data for Name: inscricao; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (26, 1, '2026-06-11 08:32:55.505699', 'teste1 editado', '081.540.193-53', 'mathnlzz@gmail.com', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (32, 5, '2026-06-12 08:30:24.734893', 'Matheus Nunes Lima', '088.902.803-60', 'mathnlzz@gmail.com', '88996044096', 'Sim', 'Sim', 'UFC', 'uploads\1781263824687-825795303.pdf');
INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (33, 5, '2026-06-18 18:31:56.548536', 'Matheus Nunes Lima', '088.902.803', 'mathnlzz@gmail.com', '88996044096', 'Sim', 'Sim', 'UFC', 'uploads\1781818316495-401475732.pdf');
INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (34, 5, '2026-06-18 18:36:48.982492', 'Matheus Nunes Lima', '088.902.803-11', 'mathnlzz@gmail.com', '(88) 99604-4096', 'Sim', 'Sim', 'UFC', 'uploads\1781818608940-687707503.pdf');
INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (35, 1, '2026-06-19 13:40:49.917619', 'teste manual', '1231312312312', 'mathnlzz@gmail.com', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.inscricao (id, curso_id, datainscricao, nome, documento, email, telefone, conhecimento_programacao, conhecimento_robotica, instituicao_ensino, termo_consentimento) VALUES (36, 26, '2026-06-19 13:41:47.8703', 'Matheus Nunes Lima', '088.902.803-60', 'mathnlzz@gmail.com', '(88) 99604-4096', 'Sim', 'Sim', 'UFC', 'uploads\1781887307810-372726015.pdf');


--
-- TOC entry 5163 (class 0 OID 16554)
-- Dependencies: 241
-- Data for Name: materiais; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.materiais (id, titulo, categoria, tipo, link, criado_em) VALUES (1, 'teste materiais curso', 'materiais', 'teste', 'https://github.com/MatheusNLima/EPRA', '2026-06-19 10:28:23.319251');
INSERT INTO public.materiais (id, titulo, categoria, tipo, link, criado_em) VALUES (2, 'teste códigos', 'codigos', 'teste', 'https://github.com/MatheusNLima/EPRA', '2026-06-19 10:28:36.437605');
INSERT INTO public.materiais (id, titulo, categoria, tipo, link, criado_em) VALUES (3, 'teste bibliotecas', 'bibliotecas', 'https://github.com/MatheusNLima/EPRA', 'https://github.com/MatheusNLima/EPRA', '2026-06-19 10:28:44.311695');
INSERT INTO public.materiais (id, titulo, categoria, tipo, link, criado_em) VALUES (4, 'teste biblioteca 2', 'bibliotecas', 'teste biblioteca', 'http://127.0.0.1:5500/index.html', '2026-06-19 11:47:08.794176');


--
-- TOC entry 5152 (class 0 OID 16441)
-- Dependencies: 230
-- Data for Name: metrica_impacto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.metrica_impacto (id, descricao, valor) VALUES (9, 'Total de Inscritos', 1250);
INSERT INTO public.metrica_impacto (id, descricao, valor) VALUES (10, 'Certificados Emitidos', 450);


--
-- TOC entry 5165 (class 0 OID 16569)
-- Dependencies: 243
-- Data for Name: portfolio; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.portfolio (id, titulo, autor, descricao, link_github, criado_em) VALUES (1, 'teste11', 'teste', 'teste', 'https://github.com/MatheusNLima/EPRA', '2026-06-18 19:36:17.015074');
INSERT INTO public.portfolio (id, titulo, autor, descricao, link_github, criado_em) VALUES (2, 'teste2', 'Reuber', 'teste 1906', 'https://github.com/MatheusNLima/EPRA', '2026-06-19 13:43:06.588863');


--
-- TOC entry 5169 (class 0 OID 16607)
-- Dependencies: 247
-- Data for Name: solucao_desafio; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5154 (class 0 OID 16447)
-- Dependencies: 232
-- Data for Name: submissao; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.submissao (id, usuario_id, desafio_id, linkgithub, dataenvio) VALUES (1, 3, 1, 'https://github.com/felipe/projeto-frontend', '2026-06-04 21:07:51.444244');
INSERT INTO public.submissao (id, usuario_id, desafio_id, linkgithub, dataenvio) VALUES (2, 8, 5, 'https://github.com/yuri/cinema-uml', '2026-06-04 21:07:51.444244');


--
-- TOC entry 5156 (class 0 OID 16455)
-- Dependencies: 234
-- Data for Name: tutorial; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tutorial (id, titulo, conteudo, linkgithub) VALUES (17, 'Guia de Git e GitHub', 'Comandos essenciais para versionamento.', 'https://github.com/exemplo/guia-git');
INSERT INTO public.tutorial (id, titulo, conteudo, linkgithub) VALUES (18, 'Criando uma API com Express', 'Passo a passo para rotas de backend.', 'https://github.com/exemplo/api-express');


--
-- TOC entry 5158 (class 0 OID 16463)
-- Dependencies: 236
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (1, 'Carlos Roberto', 'carlos.orientador@faculdade.com', 'hash123', 'Engenharia de Software', 'ORIENTADOR', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (2, 'Mariana Souza', 'mariana.aluno@estudante.com', 'hash456', 'Ciência da Computação', 'ALUNO_INTERNO', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (3, 'Felipe Andrade', 'felipe.ext@provedor.com', 'hash789', 'Sistemas de Informação', 'ALUNO_EXTERNO', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (4, 'Juliana Lima', 'juliana.orientadora@faculdade.com', 'hash012', 'Design Digital', 'ORIENTADOR', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (5, 'Nádia Freitas', 'nadia.freitas@faculdade.com', 'senha_forte_1', 'Engenharia de Software', 'ORIENTADOR', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (6, 'Gabriel Toledo', 'gabriel.aluno@estudante.com', 'senha_forte_2', 'Sistemas de Informação', 'ALUNO_INTERNO', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (7, 'Laura Santos', 'lora.duo@provedor.com', 'senha_forte_3', 'Ciência da Computação', 'ALUNO_EXTERNO', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (8, 'Yuri Gomes', 'yuri.dev@email.com', 'senha_forte_4', 'Engenharia da Computação', 'ALUNO_INTERNO', true);
INSERT INTO public.usuario (id, nome, email, senhahash, curso, tipo, ativo) VALUES (9, 'Ranya Silva', 'ranya.aluna@estudante.com', 'senha_forte_5', 'Design Digital', 'ALUNO_EXTERNO', true);


--
-- TOC entry 5160 (class 0 OID 16475)
-- Dependencies: 238
-- Data for Name: vaga; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vaga (id, titulo, descricao, datalimite) VALUES (1, 'Estágio Desenvolvedor Junior', 'Vaga para atuar no suporte e desenvolvimento.', '2026-12-01 23:59:00');
INSERT INTO public.vaga (id, titulo, descricao, datalimite) VALUES (2, 'Analista de Dados Pleno', 'Experiência com SQL e visualização de dados.', '2026-06-30 18:00:00');
INSERT INTO public.vaga (id, titulo, descricao, datalimite) VALUES (3, 'Estágio em QA (Testes)', 'Atuação com testes manuais e automatizados.', '2026-11-15 23:59:00');
INSERT INTO public.vaga (id, titulo, descricao, datalimite) VALUES (4, 'Desenvolvedor Fullstack Trainee', 'Manjar de Express, HTML, CSS e JS.', '2026-10-30 18:00:00');


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidatura_id_seq', 2, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 244
-- Name: candidatura_vaga_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidatura_vaga_id_seq', 1, true);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 223
-- Name: curso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_id_seq', 26, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 225
-- Name: depoimento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depoimento_id_seq', 18, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 227
-- Name: desafio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.desafio_id_seq', 20, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 229
-- Name: inscricao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inscricao_id_seq', 36, true);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 240
-- Name: materiais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materiais_id_seq', 4, true);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 231
-- Name: metrica_impacto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metrica_impacto_id_seq', 10, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 242
-- Name: portfolio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_id_seq', 2, true);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 246
-- Name: solucao_desafio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solucao_desafio_id_seq', 1, false);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 233
-- Name: submissao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissao_id_seq', 2, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 235
-- Name: tutorial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tutorial_id_seq', 18, true);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 237
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 36, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 239
-- Name: vaga_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vaga_id_seq', 16, true);


--
-- TOC entry 4958 (class 2606 OID 16494)
-- Name: candidatura candidatura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura
    ADD CONSTRAINT candidatura_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 16600)
-- Name: candidatura_vaga candidatura_vaga_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura_vaga
    ADD CONSTRAINT candidatura_vaga_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 16496)
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 16498)
-- Name: depoimento depoimento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depoimento
    ADD CONSTRAINT depoimento_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 16500)
-- Name: desafio desafio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.desafio
    ADD CONSTRAINT desafio_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16502)
-- Name: inscricao inscricao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricao
    ADD CONSTRAINT inscricao_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 16567)
-- Name: materiais materiais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais
    ADD CONSTRAINT materiais_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 16504)
-- Name: metrica_impacto metrica_impacto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrica_impacto
    ADD CONSTRAINT metrica_impacto_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 16582)
-- Name: portfolio portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT portfolio_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 16619)
-- Name: solucao_desafio solucao_desafio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solucao_desafio
    ADD CONSTRAINT solucao_desafio_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 16506)
-- Name: submissao submissao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissao
    ADD CONSTRAINT submissao_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 16508)
-- Name: tutorial tutorial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutorial
    ADD CONSTRAINT tutorial_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 16510)
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- TOC entry 4976 (class 2606 OID 16512)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16514)
-- Name: vaga vaga_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vaga
    ADD CONSTRAINT vaga_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 16601)
-- Name: candidatura_vaga candidatura_vaga_vaga_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura_vaga
    ADD CONSTRAINT candidatura_vaga_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vaga(id) ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 16548)
-- Name: inscricao fk_curso_cascade; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricao
    ADD CONSTRAINT fk_curso_cascade FOREIGN KEY (curso_id) REFERENCES public.curso(id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 16515)
-- Name: inscricao fk_curso_inscricao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscricao
    ADD CONSTRAINT fk_curso_inscricao FOREIGN KEY (curso_id) REFERENCES public.curso(id) ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 16520)
-- Name: submissao fk_desafio_submissao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissao
    ADD CONSTRAINT fk_desafio_submissao FOREIGN KEY (desafio_id) REFERENCES public.desafio(id) ON DELETE CASCADE;


--
-- TOC entry 4987 (class 2606 OID 16525)
-- Name: candidatura fk_usuario_candidatura; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura
    ADD CONSTRAINT fk_usuario_candidatura FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 16535)
-- Name: submissao fk_usuario_submissao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissao
    ADD CONSTRAINT fk_usuario_submissao FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 16540)
-- Name: candidatura fk_vaga_candidatura; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidatura
    ADD CONSTRAINT fk_vaga_candidatura FOREIGN KEY (vaga_id) REFERENCES public.vaga(id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 16620)
-- Name: solucao_desafio solucao_desafio_desafio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solucao_desafio
    ADD CONSTRAINT solucao_desafio_desafio_id_fkey FOREIGN KEY (desafio_id) REFERENCES public.desafio(id) ON DELETE CASCADE;


-- Completed on 2026-06-23 08:19:12

--
-- PostgreSQL database dump complete
--

\unrestrict HpwiTYcgh2F6BoEGPnlhehPCUPrCeX8FaiznVq2v9CfrhCbmhRvwhl7BFPrVFKI