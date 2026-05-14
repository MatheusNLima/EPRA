const express = require('express');
const cors = require('cors');

const cursoRoutes = require('./routes/cursoRoutes');
const vagaRoutes = require('./routes/vagaRoutes');
const materialRoutes = require('./routes/materialRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const impactoRoutes = require('./routes/impactoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'online', projeto: 'EPRA' });
});

app.use('/api/cursos', cursoRoutes);
app.use('/api/vagas', vagaRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/tutoriais', tutorialRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/impacto', impactoRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Gateway Node.js rodando na porta ${PORT}`);
});