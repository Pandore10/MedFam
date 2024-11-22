const express = require('express');
const medControle = require('../controllers/medControle');
const { autenticarToken } = require('../controllers/authControle');
const router = express.Router();

// Rota para buscar medicamentos gerais
router.get('/', medControle.getMedicamentos);

// Rota para adicionar medicamento do cliente
router.post('/adicionar', autenticarToken, medControle.addMedicamento);

// Rota para listar os medicamentos do cliente
router.get('/cliente', autenticarToken, medControle.getMedicamentosCliente);

// Rota para buscar um medicamento do cliente por ID
router.get('/cliente/:id', autenticarToken, medControle.getMedicamentoClientePorId);

// Rota para editar medicamento do cliente
router.put('/cliente/:id', autenticarToken, medControle.updateMedicamentoCliente);

// Rota para deletar medicamento do cliente
router.delete('/cliente/:id', autenticarToken, medControle.deleteMedicamentoCliente);

// Rota para notificar sobre medicamentos com estoque baixo
router.get('/notificacao/estoque', medControle.notificarEstoqueBaixo);

// Rota para notificar sobre medicamentos com validade próxima
router.get('/notificacao/validade', medControle.notificarValidadeProxima);

module.exports = router;
