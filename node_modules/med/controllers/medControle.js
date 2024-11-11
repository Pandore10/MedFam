const {
    buscarMedicamentos,
    buscarMedicamentosCliente,
    adicionarMedicamentoCliente,
    buscarMedicamentoPorId,
    editarMedicamentoCliente,
    deletarMedicamentoCliente,
} = require('../models/medModel');

// Endpoint para buscar medicamentos gerais
exports.getMedicamentos = (req, res) => {
    const termoBusca = req.query.termo;
    const resultados = buscarMedicamentos(termoBusca);
    res.json(resultados);
};

// Endpoint para adicionar medicamento do cliente
exports.addMedicamento = async (req, res) => {
    const { nome, quantidade, dataValidade } = req.body;
    if (!nome || !quantidade || !dataValidade) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const dataRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dataRegex.test(dataValidade)) {
        return res.status(400).json({ error: 'Data de validade deve estar no formato DD-MM-AAAA.' });
    }

    try {
        const resultado = await adicionarMedicamentoCliente(nome, quantidade, dataValidade);
        res.status(201).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar medicamento do cliente.' });
    }
};

// Endpoint para buscar medicamentos do cliente
exports.getMedicamentosCliente = async (req, res) => {
    try {
        const medicamentos = await buscarMedicamentosCliente();
        res.json(medicamentos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar medicamentos do cliente.' });
    }
};

// Endpoint para buscar medicamento do cliente por ID
exports.getMedicamentoClientePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const medicamento = await buscarMedicamentoPorId(id);
        if (!medicamento) {
            return res.status(404).json({ error: 'Medicamento não encontrado.' });
        }
        res.json(medicamento);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar medicamento.' });
    }
};

// Endpoint para editar medicamento do cliente
exports.updateMedicamentoCliente = async (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, dataValidade } = req.body;

    if (!nome || !quantidade || !dataValidade) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const medicamentoEditado = await editarMedicamentoCliente(id, nome, quantidade, dataValidade);
        if (!medicamentoEditado) {
            return res.status(404).json({ error: 'Medicamento não encontrado.' });
        }
        res.json(medicamentoEditado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar medicamento.' });
    }
};

// Endpoint para deletar medicamento do cliente
exports.deleteMedicamentoCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const medicamentoDeletado = await deletarMedicamentoCliente(id);
        if (!medicamentoDeletado) {
            return res.status(404).json({ error: 'Medicamento não encontrado.' });
        }
        res.json({ message: 'Medicamento excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir medicamento.' });
    }
};
