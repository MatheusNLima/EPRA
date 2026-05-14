const obterImpacto = (req, res) => {
    res.status(200).json({
        escolas_atendidas: 12,
        alunos_impactados: 450,
        horas_ensino: '+1000'
    });
};
module.exports = { obterImpacto };