const { Pool } = require('pg');

// Configurações do banco de dados
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'med_database',
    password: '2528',
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

// Função para buscar medicamentos do cliente
const buscarMedicamentosCliente = async () => {
    const res = await pool.query('SELECT * FROM medicamentos_cliente');
    return res.rows;
};

// Função para adicionar medicamentos do cliente
const adicionarMedicamentoCliente = async (nome, quantidade, dataValidade) => {
    const query = `
        INSERT INTO medicamentos_cliente (nome, quantidade, data_validade)
        VALUES ($1, $2, $3) RETURNING *;
    `;
    const values = [nome, quantidade, dataValidade];
    const res = await pool.query(query, values);
    return res.rows[0];
};

// Função para buscar um medicamento do cliente pelo ID
const buscarMedicamentoPorId = async (id) => {
    const res = await pool.query('SELECT * FROM medicamentos_cliente WHERE id = $1', [id]);
    return res.rows[0];
};

// Função para editar medicamento do cliente
const editarMedicamentoCliente = async (id, nome, quantidade, dataValidade) => {
    const query = `
        UPDATE medicamentos_cliente
        SET nome = $1, quantidade = $2, data_validade = $3
        WHERE id = $4 RETURNING *;
    `;
    const values = [nome, quantidade, dataValidade, id];
    const res = await pool.query(query, values);
    return res.rows[0];
};

// Função para deletar medicamento do cliente
const deletarMedicamentoCliente = async (id) => {
    const query = 'DELETE FROM medicamentos_cliente WHERE id = $1 RETURNING *;';
    const values = [id];
    const res = await pool.query(query, values);
    return res.rows[0];
};

module.exports = {
    buscarMedicamentos,
    buscarMedicamentosCliente,
    adicionarMedicamentoCliente,
    buscarMedicamentoPorId,
    editarMedicamentoCliente,
    deletarMedicamentoCliente,
};
