const express = require('express');
const medControle = require('../controllers/medControle');
const router = express.Router();

// Rota para buscar medicamentos
router.get('/', medControle.getMedicamentos); // Chama a função para buscar medicamentos

// Rota para adicionar medicamento do cliente
router.post('/adicionar', medControle.addMedicamento); // Chama a função para adicionar medicamento

module.exports = router; // Exporta as rotas para serem usadas no servidor