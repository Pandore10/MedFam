const { Pool } = require('pg');

const pool = new Pool({
    user: 'usuario', // Substitua pelo seu usuário do PostgreSQL (se tiver padrao vai ser postgres msm)
    host: 'localhost',
    database: 'med_database', // Substitua pelo nome do banco de dados
    password: 'senha', // Substitua pela sua senha do PostgreSQL
    port: 5432, // Porta padrão do PostgreSQL
});

module.exports = pool;