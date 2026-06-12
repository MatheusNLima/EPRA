const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'epra_db',
    password: process.env.DB_PASSWORD || 'senhagenerica123',
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};