const {
    buscarMedicamentos,
    buscarMedicamentosGrupo,
    adicionarMedicamentoGrupo,
    buscarMedicamentoPorId,
    editarMedicamentoGrupo,
    deletarMedicamentoGrupo,
} = require('../models/medModel');
const { getGrupoId } = require('../controllers/grupoController');

// Endpoint para buscar medicamentos gerais
exports.getMedicamentos = (req, res) => {
    const termoBusca = req.query.termo;
    const resultados = buscarMedicamentos(termoBusca);
    res.json(resultados);
};

// Endpoint para adicionar medicamento do grupo
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
        const grupoID = await getGrupoId(req, res);

        await adicionarMedicamentoGrupo(grupoID, nome, quantidade, dataValidade);
        res.status(201).json({ message: 'Medicamentos adicionados com sucesso.'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar medicamento do cliente.' });
    }
};

// Endpoint para buscar medicamentos do grupo
exports.getMedicamentosGrupo = async (req, res) => {
    try {
        const grupoID = await getGrupoId(req, res);
        const medicamentos = await buscarMedicamentosGrupo(grupoID);
        res.json(medicamentos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar medicamentos do grupo.' });
    }
};

// Endpoint para buscar medicamento do grupo por ID
exports.getMedicamentoGrupoPorId = async (req, res) => {
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

// Endpoint para editar medicamento do grupo
exports.updateMedicamentoGrupo = async (req, res) => {
    const { nome, quantidade, dataValidade } = req.body;
    const { id } = req.params;

    console.log({id, nome, quantidade, dataValidade});

    if (!nome || !quantidade || !dataValidade) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const medicamentoEditado = await editarMedicamentoGrupo(id, nome, quantidade, dataValidade);
        if (!medicamentoEditado) {
            return res.status(404).json({ error: 'Medicamento não encontrado.' });
        }
        res.json(medicamentoEditado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao editar medicamento.' });
    }
};

// Endpoint para deletar medicamento do grupo
exports.deleteMedicamentoGrupo = async (req, res) => {
    const { id } = req.params;
    try {
        const medicamentoDeletado = await deletarMedicamentoGrupo(id);
        if (!medicamentoDeletado) {
            return res.status(404).json({ error: 'Medicamento não encontrado.' });
        }
        res.json({ message: 'Medicamento excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir medicamento.' });
    }
};

// Endpoints de Notificações de Estoque e Validade

// Endpoint para verificar e enviar notificações de estoque baixo
exports.notificarEstoqueBaixo = async (req, res) => {
    try {
        // Verifica medicamentos com estoque baixo (menos de 3 unidades)
        const grupoID = await getGrupoId(req, res);
        const medicamentosBaixoEstoque = await buscarMedicamentosGrupo(grupoID);
        const medicamentosNotificados = medicamentosBaixoEstoque.filter(medicamento => medicamento.quantidade <= 3);
        
        // Envia a resposta com os medicamentos de estoque baixo
        res.json(medicamentosNotificados);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar estoque baixo.' });
    }
};

// Endpoint para verificar e enviar notificações de validade próxima
exports.notificarValidadeProxima = async (req, res) => {
    try {
        // Verifica medicamentos cuja validade está para vencer em 1 semana
        const grupoID = await getGrupoId(req, res);
        const medicamentosValidadeProxima = await buscarMedicamentosGrupo(grupoID);
        const medicamentosNotificados = medicamentosValidadeProxima.filter(medicamento => {
            const validade = new Date(medicamento.data_validade);
            const hoje = new Date();
            const diferencaEmDias = (validade - hoje) / (1000 * 3600 * 24);
            return diferencaEmDias <= 7 && diferencaEmDias >= 0; // Validade próxima (até 7 dias)
        });

        // Envia a resposta com os medicamentos com validade próxima
        res.json(medicamentosNotificados);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar validade próxima.' });
    }
};
