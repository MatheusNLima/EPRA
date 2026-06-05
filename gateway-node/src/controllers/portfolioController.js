const listarPortfolio = (req, res) => {
    try {
        const projetos = [
            { id: 1, titulo: "Sistema de Gestão Escolar", autor: "Equipe Alpha", link_github: "https://github.com/exemplo/gestao" },
            { id: 2, titulo: "App de Entregas", autor: "Equipe Beta", link_github: "https://github.com/exemplo/entregas" }
        ];
        res.json(projetos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarPortfolio };