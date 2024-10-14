const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta public

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./historias.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Criação da tabela de comentários se não existir
db.run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    historia_id INTEGER,
    nome TEXT,
    comentario TEXT
)`);

// Criação da tabela de histórias se não existir
db.run(`CREATE TABLE IF NOT EXISTS historias (
    id INTEGER PRIMARY KEY,
    titulo TEXT,
    autor TEXT,
    texto TEXT
)`);

// Adicionar uma história se não existir
const historia = {
    id: 1,
    titulo: 'A Aventura de um Sonhador',
    autor: 'Autor Exemplo',
    texto: 'Era uma vez um sonhador que...'
};

// Verificar se a história já existe
db.get('SELECT * FROM historias WHERE id = ?', [historia.id], (err, row) => {
    if (!row) {
        db.run(`INSERT INTO historias (id, titulo, autor, texto) VALUES (?, ?, ?, ?)`, [historia.id, historia.titulo, historia.autor, historia.texto], function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log('História adicionada ao banco de dados.');
            }
        });
    } else {
        console.log('A história já existe no banco de dados.');
    }
});

// API para obter uma história
app.get('/historia/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM historias WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(row);
        }
    });
});

// API para obter comentários
app.get('/comentarios/:historia_id', (req, res) => {
    const historia_id = req.params.historia_id;
    db.all('SELECT * FROM comentarios WHERE historia_id = ?', [historia_id], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// API para adicionar um comentário
app.post('/comentarios', (req, res) => {
    const { historia_id, nome, comentario } = req.body;
    db.run('INSERT INTO comentarios (historia_id, nome, comentario) VALUES (?, ?, ?)', [historia_id, nome, comentario], function(err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            // Notifica todos os clientes conectados sobre o novo comentário
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ historia_id, nome, comentario }));
                }
            });
            res.json({ id: this.lastID });
        }
    });
});

// Endpoint para a raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Altere o caminho para o seu arquivo HTML
});

// Inicialização do WebSocket
const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Cliente conectado');
});
