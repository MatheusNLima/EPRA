const listarMateriais = (req, res) => {
    try {
        const materiais = [
            { id: 1, titulo: "Apostila de Estrutura de Dados", tipo: "PDF", link: "https://exemplo.com/apostila.pdf" },
            { id: 2, titulo: "Guia Rápido de SQL", tipo: "Documento", link: "https://exemplo.com/guia-sql.pdf" }
        ];
        res.json(materiais);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = { listarMateriais };