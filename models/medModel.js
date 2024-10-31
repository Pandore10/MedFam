const { Pool } = require('pg'); // Importando o pacote pg para conexão com PostgreSQL

// Configurações do banco de dados
const pool = new Pool({
    user: 'usuario', // Substitua pelo seu usuário do PostgreSQL (se tiver padrao vai ser postgres msm)
    host: 'localhost',
    database: 'med_database', // Substitua pelo nome do banco de dados
    password: 'senha', // Substitua pela sua senha do PostgreSQL
    port: 5432, // Porta padrão do PostgreSQL
});

let medicamentos = []; // Array para armazenar medicamentos carregados do banco de dados

// Função para carregar medicamentos da tabela existente
const carregarMedicamentos = async () => {
    const res = await pool.query('SELECT * FROM medicamentos'); // Consulta os medicamentos
    medicamentos = res.rows; // Armazena os resultados no array medicamentos
};

// Chama a função para carregar os medicamentos ao iniciar
carregarMedicamentos();

// Função para buscar medicamentos que correspondem ao termo de busca
const buscarMedicamentos = (termo) => {
    if (!termo) return medicamentos; // Retorna todos se não houver termo
    return medicamentos.filter(medicamento =>
        medicamento.nome_produto.toLowerCase().includes(termo.toLowerCase()) // Filtra pelo nome
    );
};

// Função para adicionar medicamento do cliente na nova tabela
const adicionarMedicamentoCliente = async (nome, quantidade, dataValidade) => {
    const query = `
        INSERT INTO medicamentos_cliente (nome, quantidade, data_validade)
        VALUES ($1, $2, $3) RETURNING *; -- Insere e retorna o medicamento adicionado
    `;
    const values = [nome, quantidade, dataValidade]; // Valores a serem inseridos
    const res = await pool.query(query, values); // Executa a consulta no banco
    return res.rows[0]; // Retorna o medicamento adicionado
};

// Exportar as funções para serem usadas em outros arquivos
module.exports = { buscarMedicamentos, adicionarMedicamentoCliente };