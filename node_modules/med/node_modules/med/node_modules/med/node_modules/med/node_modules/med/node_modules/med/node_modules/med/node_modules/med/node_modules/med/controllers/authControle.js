const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'med_database',
    password: '2528',
    port: 5432,
});

exports.registrar = async (req, res) => {
    const {username, password} = req.body;

    try {
        //Verifica se o usuário ja existe
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userQuery.rows.length > 0) {
            return res.status(400).json({ message: 'Usuário ja registrado.' });
        }

        //Hash da senha e inserção no banco
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar o usuário.' });
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        //Busca o usuário no banco
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userQuery.rows[0];

        // Isso é problema fela da pota
        // TODO: Consertar essa bosta
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userID: user.id }, 'seu segredo', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Credencias invalidas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login'});
    }
}

