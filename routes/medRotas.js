const express = require('express');
const medControle = require('../controllers/medControle');
const { autenticarToken } = require('../controllers/authControle');
const router = express.Router();

// Rota para buscar medicamentos gerais
router.get('/', medControle.getMedicamentos);

// Rota para adicionar medicamento do grupo
router.post('/adicionar', autenticarToken, medControle.addMedicamento);

// Rota para listar os medicamentos do grupo
router.get('/grupo', autenticarToken, medControle.getMedicamentosGrupo);

// Rota para buscar um medicamento do grupo por ID
router.get('/grupo/:id', autenticarToken, medControle.getMedicamentoGrupoPorId);

// Rota para editar medicamento do grupo
router.put('/grupo/:id', autenticarToken, medControle.updateMedicamentoGrupo);

// Rota para deletar medicamento do grupo
router.delete('/grupo/:id', autenticarToken, medControle.deleteMedicamentoGrupo);

// Rota para notificar sobre medicamentos com estoque baixo
router.get('/notificacao/estoque', autenticarToken, medControle.notificarEstoqueBaixo);

// Rota para notificar sobre medicamentos com validade próxima
router.get('/notificacao/validade', autenticarToken, medControle.notificarValidadeProxima);

module.exports = router;
