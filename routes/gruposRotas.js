const express = require('express');
const grupoController = require('../controllers/grupoController');
const { autenticarToken } = require('../controllers/authControle');
const router = express.Router();

router.post('/criar', autenticarToken, grupoController.criarGrupo);

router.post('/entrar', autenticarToken, grupoController.entrarGrupo);

router.get('/detalhes', autenticarToken, grupoController.detalhesGrupo);

router.post('/sair', autenticarToken, grupoController.sairGrupo);

router.post('/expulsar', autenticarToken, grupoController.expulsarGrupo);

module.exports = router;