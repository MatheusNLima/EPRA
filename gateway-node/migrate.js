const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    try {
        await pool.query("ALTER TABLE solucao_desafio ALTER COLUMN link_github DROP NOT NULL;");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS nome VARCHAR(100);");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS email VARCHAR(100);");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS descricao TEXT;");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS arquivo_path VARCHAR(255);");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS nota NUMERIC(4, 2);");
        await pool.query("ALTER TABLE solucao_desafio ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Em Avaliação';");
        try {
            await pool.query("ALTER TABLE solucao_desafio ADD CONSTRAINT unique_usuario_desafio UNIQUE (usuario_id, desafio_id);");
        } catch (e) {
            console.log("Constraint probably exists:", e.message);
        }
        console.log("Migration successful");
    } catch (err) {
        console.error("Migration failed", err);
    } finally {
        await pool.end();
    }
}

migrate();
