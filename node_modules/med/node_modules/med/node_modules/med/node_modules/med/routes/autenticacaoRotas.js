const express = require('express');
const authControle = require('../controllers/authControle')
const router = express.Router();

router.post('/registrar', authControle.registrar);

router.post('/login', authControle.login);

module.exports = router;