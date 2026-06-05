const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'epra_db',
    password: 'senhagenerica123',
    port: 5432,
});

pool.on('connect', () => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};