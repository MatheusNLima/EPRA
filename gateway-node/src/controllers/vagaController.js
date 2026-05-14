const obterVagas = (req, res) => {
    const vagas = [
        {
            id: 1,
            tipo: 'Bolsa Remunerada',
            classeBadge: 'scholarship',
            local: 'Lab 3 - Tarde',
            titulo: 'Monitor de Robótica',
            descricao: 'Auxiliar nas aulas práticas de Arduino e organizar os kits de componentes.',
            requisito: 'Domínio de C++ básico',
            carga: '12h/semana',
            qtd_vagas: 3,
            prazo: 'Até 20 de Janeiro, 2026'
        },
        {
            id: 2,
            tipo: 'Voluntariado',
            classeBadge: 'volunteer',
            local: 'Híbrido',
            titulo: 'Criador de Conteúdo',
            descricao: 'Escrita de tutoriais para o blog e roteiros de vídeo para o canal.',
            requisito: 'Boa escrita técnica',
            carga: 'Flexível',
            qtd_vagas: 2,
            prazo: 'Fluxo Contínuo'
        }
    ];

    res.status(200).json(vagas);
};

module.exports = { obterVagas };