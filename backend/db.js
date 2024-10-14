const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./historia.db');

// Criar tabelas se não existirem
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS historias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        texto TEXT NOT NULL,
        autor TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historia_id INTEGER,
        comentario TEXT NOT NULL,
        FOREIGN KEY (historia_id) REFERENCES historias (id)
    )`);
});

module.exports = db;
