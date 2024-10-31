const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const medRotas = require('./routes/medRotas'); // Importa as rotas de medicamentos

const app = express(); // Cria uma instância do Express
const PORT = 3000; // Define a porta do servidor

// Configurações do middleware
app.use(cors()); // Permite requisições de diferentes origens
app.use(bodyParser.json()); // Analisa o corpo da requisição como JSON

// Rota inicial do servidor
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Medicamentos!'); // Mensagem de boas-vindas
});

// Usando as rotas de medicamentos
app.use('/medicamentos', medRotas);

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`); // Mensagem de inicialização do servidor
});