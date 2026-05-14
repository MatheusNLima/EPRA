const obterTutoriais = (req, res) => {
    res.status(200).json([
        { id: 1, titulo: 'Piscar LED com Arduino', nivel: 'Iniciante', tipo: 'Texto', link: '#' },
        { id: 2, titulo: 'Lendo Sensores Ultrassônicos', nivel: 'Intermediário', tipo: 'Vídeo', link: '#' }
    ]);
};
module.exports = { obterTutoriais };