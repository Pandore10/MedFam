const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'medDatabase',
    password: '2528',
    port: 5432,
});

exports.getGrupoId = async (req, res) => {
    
    if (!req.user || !req.user.userID) {
        throw new Error('Usuário não autenticado ou sem ID associado.');
    }

    const userID = req.user.userID;

    try {
        const grupoQuery = await pool.query(
            'SELECT id_grupo FROM users WHERE id = $1', [userID]
        );
    
        if (grupoQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não pertence a nenhum grupo.'})
        }

        return grupoQuery.rows[0].id_grupo;

    } catch (error) {
        console.error('Erro ao buscar grupo: ', error.message);
        throw new Error('Erro ao buscar grupo.');
    }
}

const gerarCodigo = async () => {
    const codigoGerado = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { rows } = await pool.query('SELECT * FROM grupos_residenciais WHERE codigo = ($1)', [codigoGerado]);

    if (rows.length > 0) {
        return gerarCodigo();
    }

    return codigoGerado;
}

exports.criarGrupo = async (req, res) => {

    const { nome } = req.body;

    try {
        const userID = req.user.userID;
    
        const { rows } = await pool.query('SELECT nome, id_grupo FROM users WHERE id = $1', [userID]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        console.log(rows[0]);

        if (rows[0].id_grupo !== null) {
            return res.status(401).json({ error: 'Usuário já está em um grupo'});
        }

        const nomeUsuario = rows[0].nome;
    
        const nomeGrupo = nome?.trim() || `Casa de ${nomeUsuario}`;

        const codigo = await gerarCodigo();

        const { rows: grupoColunas } = await pool.query(
            'INSERT INTO grupos_residenciais (nome, codigo, id_admin) VALUES ($1, $2, $3) RETURNING id, nome, codigo', [nomeGrupo, codigo, userID]
        );
    
        const grupoCriado =  [grupoColunas[0].nome, grupoColunas[0].codigo];

        const grupoId = grupoColunas[0].id;
        
        console.log('Debug: ', grupoId, userID);

        await pool.query('UPDATE users SET id_grupo = $1 WHERE id = $2', [grupoId, userID]);

        return res.status(201).json({ 
            grupo: grupoCriado,
            pertenceAGrupo: true 
        });
    } catch (error) {
        console.error('Erro ao criar grupo residencial: ', error.message);
        res.status(500).json({ error: 'Erro interno do servidor.'});
    } 
}

exports.entrarGrupo = async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({ error: 'Código do grupo é obrigatório.'})
    }

    try {
        const userID = req.user.userID;

        const grupoQuery = await pool.query(
            'SELECT id FROM grupos_residenciais WHERE codigo = $1', [codigo]
        );

        if (grupoQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Grupo não encontrado.'});
        }

        const grupoID = grupoQuery.rows[0].id;

        await pool.query(
            'UPDATE users SET id_grupo = $1 WHERE id = $2', [grupoID, userID]
        );

        return res.status(200).json({ 
            message: 'Usuário adicionado ao grupo com sucesso.',
            pertenceAGrupo: true
        });
    
    } catch (error) {
        console.error('Erro ao entrar no grupo', error.message);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } 
}

exports.sairGrupo = async (req, res) => {

    try {
        const grupoID = await this.getGrupoId(req, res);

        if (!grupoID) {
            return res.status(404).json({ error: 'Usuário não faz parte de nenhum grupo.'});
        }

        const grupoQuery = await pool.query(
            'SELECT users.id, grupos_residenciais.id_admin FROM users LEFT JOIN grupos_residenciais ON grupos_residenciais.id = users.id_grupo WHERE id_grupo = $1;', [grupoID]
        );

        if (grupoQuery.rows.length === 0) {
            return res.status(500).json({ error: 'Grupo sem membros.'});
        }

        const userID = req.user.userID;

        if (grupoQuery.rows.length === 1) {
            await pool.query(
                'UPDATE users SET id_grupo = null WHERE id = $1 AND id_grupo = $2', [userID, grupoID]
            );
            
            await pool.query(
                'DELETE FROM medicamentos_grupo WHERE id_grupo = $1', [grupoID]
            );

            await pool.query(
                'DELETE FROM grupos_residenciais WHERE id = $1', [grupoID]
            );

            return res.status(200).json({ message: 'Remoção de usuário e exclusão do grupo feito com sucesso.'});
        }

        if (grupoQuery.rows.length > 1 ) {

            if (userID === grupoQuery.rows[0].id_admin) {
                return res.status(403).json({ error: 'O responsável não pode sair do grupo se não estiver sozinho.'});
            }
            
            await pool.query(
                'UPDATE users SET id_grupo = null WHERE id = $1', [userID]
            );

            return res.status(200).json({ message: 'Usuário saiu do grupo com sucesso.'});
        }
    } catch (error) {
        console.error('Erro ao sair/excluir grupo: ', error);
        res.status(500).json({ error: 'Erro interno do servidor.'});
    }
}

exports.detalhesGrupo = async (req, res) => {

    try{
        const grupoID = await this.getGrupoId(req, res);

        if (!grupoID) {
            return res.status(404).json({ error: 'Usuário não faz parte de nenhum grupo.'});
        }

        const { rows } = await pool.query(
            'SELECT users.id AS userID, users.nome AS usuario_nome, users.id_grupo, grupos_residenciais.nome AS grupo_nome, grupos_residenciais.codigo, grupos_residenciais.id_admin FROM users LEFT JOIN grupos_residenciais ON grupos_residenciais.id = users.id_grupo WHERE id_grupo = $1;',
            [grupoID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Grupo informado não existe.'});
        }

        const nomeGrupo = rows[0].grupo_nome;
        const numeroMembros = rows.length;
        const codigo = rows[0].codigo;
        const membros = [];
        let responsavel = "";

       for (let i = 0; i < rows.length; i++) {
            if (rows[i].userid === rows[i].id_admin) {
                responsavel = rows[i].usuario_nome;
            }

            membros.push(rows[i].usuario_nome);
        }
        const infos = {
            nomeGrupo, 
            responsavel, 
            numeroMembros,
            codigo, 
            membros
        };

        return res.status(200).json({ Informações: infos});

    } catch (error) {
        console.error('Não foi possivel exibir os detalhes do grupo: ', error);
        res.status(500).json({ error: 'Erro interno do servidor'});
    }
}

exports.expulsarGrupo = async (req, res) => {

    try {
        const { deleteUsuario } = req.body;
        const userID = req.user.userID;
        const grupoID = await this.getGrupoId(req, res);

        const grupoQuery = await pool.query(
            'SELECT users.id, users.id_grupo, grupos_residenciais.id_admin FROM users LEFT JOIN grupos_residenciais ON grupos_residenciais.id = users.id_grupo WHERE id_grupo = $1 AND users.nome = $2', [grupoID, deleteUsuario]
        );

        if (grupoQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não participa do grupo informado.'});
        }

        if (grupoQuery.rows[0].id === userID) {
            return res.status(403).json({ error: 'Não pode expulsar a si mesmo.'});
        }

        let isAdmin = false;
        for (let i = 0; i < grupoQuery.rows.length; i++) {
            if (userID === grupoQuery.rows[i].id_admin) {
                isAdmin = true;
                break;
            }
        }

        if (!isAdmin) {
            return res.status(401).json({ error: 'Usuário não é o responsável pelo grupo.'});
        }

        await pool.query(
            'UPDATE users SET id_grupo = null WHERE id = $1', [grupoQuery.rows[0].id]
        );

        return res.status(200).json({ message: 'Usuário removido com sucesso.'});
    } catch (error) {
        console.error('Erro ao expulsar um usuário do grupo', error);
        res.status(500).json({ error: 'Erro interno do servidor'});
    }
}