const express = require('express');
const medControle = require('../controllers/medControle');
const router = express.Router();

// Rota para buscar medicamentos gerais
router.get('/', medControle.getMedicamentos);

// Rota para adicionar medicamento do cliente
router.post('/adicionar', medControle.addMedicamento);

// Rota para listar os medicamentos do cliente
router.get('/cliente', medControle.getMedicamentosCliente);

// Rota para buscar um medicamento do cliente por ID
router.get('/cliente/:id', medControle.getMedicamentoClientePorId);

// Rota para editar medicamento do cliente
router.put('/cliente/:id', medControle.updateMedicamentoCliente);

// Rota para deletar medicamento do cliente
router.delete('/cliente/:id', medControle.deleteMedicamentoCliente);

module.exports = router;
