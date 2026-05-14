const obterPortfolio = (req, res) => {
    res.status(200).json([
        { id: 1, titulo: 'Braço Robótico Controlado via Web', autor: 'Ana Silva', tipoMidia: 'video', selo: '▶ Video', link: '#' },
        { id: 2, titulo: 'Estufa Automatizada', autor: 'Carlos Eduardo', tipoMidia: 'foto', selo: '📷 Foto', link: '#' }
    ]);
};
module.exports = { obterPortfolio };