const obterCursos = (req, res) => {
    const cursos = [
        {
            id: 1,
            categoria: 'proximos',
            status: 'Inscrições Abertas',
            vagas: 8,
            titulo: 'Arduino para Iniciantes',
            descricao: 'Aprenda os fundamentos de Arduino e eletrônica básica.',
            inicio: '15 de Janeiro, 2026',
            duracao: '4 semanas • Segundas e Quartas, 18h-20h',
            local: 'Laboratório 3 - Bloco 1A'
        },
        {
            id: 2,
            categoria: 'historico',
            ano: 2025,
            qtd_cursos: 8,
            qtd_alunos: 245,
            titulo: 'Cursos focados em IoT e automação'
        }
    ];

    res.status(200).json(cursos);
};

module.exports = {
    obterCursos
};