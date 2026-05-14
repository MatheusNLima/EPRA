const express = require('express');
const cors = require('cors');
const cursoRoutes = require('./routes/cursoRoutes');
const vagaRoutes = require('./routes/vagaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'online', projeto: 'EPRA' });
});

app.use('/api/cursos', cursoRoutes);
app.use('/api/vagas', vagaRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Gateway Node.js rodando na porta ${PORT}`);
});