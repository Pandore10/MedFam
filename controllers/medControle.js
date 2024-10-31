const { buscarMedicamentos, adicionarMedicamentoCliente } = require('../models/medModel');

// Função para buscar medicamentos com base no termo fornecido
exports.getMedicamentos = (req, res) => {
    const termoBusca = req.query.termo; // Captura o termo de busca da query
    const resultados = buscarMedicamentos(termoBusca); // Busca medicamentos
    res.json(resultados); // Retorna os resultados como JSON
};

// Função para adicionar medicamento do cliente
exports.addMedicamento = async (req, res) => {
    const { nome, quantidade, dataValidade } = req.body; // Extrai dados do corpo da requisição

    // Verifica se todos os campos obrigatórios estão presentes
    if (!nome || !quantidade || !dataValidade) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Valida o formato da data de validade
    const dataRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dataRegex.test(dataValidade)) {
        return res.status(400).json({ error: 'Data de validade deve estar no formato DD-MM-AAAA.' });
    }

    try {
        const resultado = await adicionarMedicamentoCliente(nome, quantidade, dataValidade); // Adiciona o medicamento
        res.status(201).json(resultado); // Retorna o medicamento adicionado
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar medicamento do cliente.' }); // Retorna erro em caso de falha
    }
};