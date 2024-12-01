const { Pool } = require('pg');

// Configurações do banco de dados
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'medDatabase',
    password: '',
    port: 5432,
});

let medicamentos = []; // Array para armazenar medicamentos carregados do banco

// Carregar medicamentos da tabela existente
const carregarMedicamentos = async () => {
    const res = await pool.query('SELECT * FROM medicamentos');
    medicamentos = res.rows;
};

carregarMedicamentos();

// Função para buscar medicamentos na base geral
const buscarMedicamentos = (termo) => {
    if (!termo) return medicamentos;
    return medicamentos.filter(medicamento =>
        medicamento.nome_produto.toLowerCase().includes(termo.toLowerCase())
    );
};

// Função para buscar medicamentos do grupo
const buscarMedicamentosGrupo = async (grupoID) => {
    const query = `SELECT * FROM medicamentos_grupo WHERE id_grupo = ($1);`;
    const value = [grupoID];

    const res = await pool.query(query, value);
    return res.rows;
};

// Função para adicionar medicamentos do grupo
const adicionarMedicamentoGrupo = async (grupoID, nome, quantidade, dataValidade) => {
    const query = 
        `INSERT INTO medicamentos_grupo (id_grupo, nome, quantidade, data_validade)
        VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [grupoID, nome, quantidade, dataValidade];
    const res = await pool.query(query, values);
    return res.rows[0];
};

// Função para buscar um medicamento do grupo pelo ID
const buscarMedicamentoPorId = async (id) => {
    const res = await pool.query('SELECT * FROM medicamentos_grupo WHERE id = $1', [id]);
    return res.rows[0];
};

// Função para editar medicamento do grupo
const editarMedicamentoGrupo = async (id, nome, quantidade, dataValidade) => {
    const query = 
        `UPDATE medicamentos_grupo
        SET nome = $1, quantidade = $2, data_validade = $3
        WHERE id = $4 RETURNING *;`;
    const values = [nome, quantidade, dataValidade, id];
    const res = await pool.query(query, values);
    return res.rows[0];
};

// Função para deletar medicamento do grupo
const deletarMedicamentoGrupo = async (id) => {
    const query = 'DELETE FROM medicamentos_grupo WHERE id = $1 RETURNING *;';
    const values = [id];
    const res = await pool.query(query, values);
    return res.rows[0];
};

module.exports = {
    buscarMedicamentos,
    buscarMedicamentosGrupo,
    adicionarMedicamentoGrupo,
    buscarMedicamentoPorId,
    editarMedicamentoGrupo,
    deletarMedicamentoGrupo,
};
