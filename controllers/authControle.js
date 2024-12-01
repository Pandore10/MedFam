const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'medDatabase',
    password: '2528',
    port: 5432,
});

exports.registrar = async (req, res) => {
    const {nome, email, password} = req.body;

    try {
        //Verifica se o usuário ja existe
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userQuery.rows.length > 0) {
            return res.status(400).json({ message: 'Usuário ja registrado.' });
        }

        //Hash da senha e inserção no banco
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (nome, email, password) VALUES ($1, $2, $3)', [nome, email, hashedPassword]);

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar o usuário.' });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //Busca o usuário no banco
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {

            const pertenceAGrupo = !!user.id_grupo;

            const token = jwt.sign({ userID: user.id }, 'seu segredo', { expiresIn: '1h' });
            res.json({ 
                token,
                pertenceAGrupo
             });
        } else {
            res.status(401).json({ message: 'Credencias invalidas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login'});
    }
}

exports.autenticarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    const tokenLimpo = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenLimpo, 'seu segredo', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalido ou expirado'});
        }

        req.user = { userID: decoded.userID };
        next();
    });
}