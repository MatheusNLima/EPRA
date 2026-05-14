const obterMateriais = (req, res) => {
    const materiais = [
        {
            id: 1,
            categoria: 'materiais',
            titulo: 'Pacote de Slides - Introdução',
            descricao: 'Slides das aulas teóricas de 1 a 5.',
            infoExtra: '25 MB total',
            tipoBotao: 'download'
        },
        {
            id: 2,
            categoria: 'codigos',
            titulo: 'Repositório Base - Arduino',
            descricao: 'Códigos utilizados nas aulas práticas no laboratório.',
            infoExtra: 'GitHub',
            tipoBotao: 'link'
        },
        {
            id: 3,
            categoria: 'bibliotecas',
            titulo: 'Lib ESP32 Custom',
            descricao: 'Biblioteca modificada para os projetos de IoT da equipe.',
            infoExtra: 'ZIP - 2 MB',
            tipoBotao: 'download'
        }
    ];

    res.status(200).json(materiais);
};

module.exports = { obterMateriais };